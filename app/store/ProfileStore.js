import { makeAutoObservable, observable, runInAction, reaction } from 'mobx'

class ProfileData {
  cookeds = observable.array()
  isLoading = false
  isLoadingNextPage = false
  page = 1
  hasMore = true

  stats = undefined
  bio = undefined
  imageUrl = undefined
  imagePath = undefined
  isPatron = false

  constructor() {
    makeAutoObservable(this)
  }
}

export class ProfileStore {
  followingUsers = observable.map()

  communityFeed = observable.array()

  isLoadingCommunityFeed = undefined
  isLoadingCommunityFeedNextPage = false
  communityFeedPage = 1
  hasMoreCommunityFeed = true

  needsRefreshCommunityFeed = false

  profileDataMap = observable.map()

  cookedStats = observable.map()

  constructor(apiClient, imagePreloader, cookedStore, recipeCookedDraftStore) {
    this.apiClient = apiClient
    this.imagePreloader = imagePreloader
    this.cookedStore = cookedStore
    this.recipeCookedDraftStore = recipeCookedDraftStore

    reaction(
      () => this.communityFeed.length,
      () => {
        for (const cooked of this.communityFeed) {
          this.preloadProfile(cooked.username)
        }
      },
    )

    makeAutoObservable(this)
  }

  getProfileImageUrl(username) {
    return this.profileDataMap.get(username)?.imageUrl
  }

  getBio(username) {
    return this.profileDataMap.get(username)?.bio
  }

  isPatron(username) {
    return this.profileDataMap.get(username)?.isPatron === true
  }

  async updateProfileImage(username, file) {
    const response = await this.apiClient.uploadFormData({
      url: `/user/profile/image`,
      method: 'post',
      data: {
        'profile-image': file,
      },
    })

    console.log('response.data', response)

    runInAction(() => {
      // Update the profile data with new image information
      const profileData = this.profileDataMap.get(username)
      profileData.imagePath = response.imagePath

      // Add cache-busting timestamp to ensure image reloads
      const baseImageUrl = response['image-url']
      const separator = baseImageUrl.includes('?') ? '&' : '?'
      profileData.imageUrl = `${baseImageUrl}${separator}t=${Date.now()}`
    })

    // Clear FastImage cache to ensure the new image is loaded
    if (this.imagePreloader) {
      this.imagePreloader.clearCache()
    }
  }

  async updateBio(username, bio) {
    runInAction(() => {
      this.profileDataMap.get(username).bio = bio
    })

    const response = await this.apiClient.patch(`/user/metadata`, { bio })

    runInAction(() => {
      this.profileDataMap.get(username).bio = response.updated.bio
    })
  }

  async follow(username) {
    const followingUser = await this.apiClient.put('/following', { username })

    runInAction(() => {
      this.followingUsers.replace(new Map([[username, followingUser], ...this.followingUsers]))

      const followProfileData = this.profileDataMap.get(username)
      if (followProfileData) {
        followProfileData.stats['followers-count']++
      }

      this.checkNeedsRefreshCommunityFeed()
    })
  }

  async unfollow(username) {
    await this.apiClient.delete('/following', { data: { username } })

    runInAction(() => {
      this.followingUsers.delete(username)

      const followProfileData = this.profileDataMap.get(username)
      if (followProfileData) {
        followProfileData.stats['followers-count']--
      }
    })
  }

  async blockUser(username) {
    // When user is blocked, he will be removed from following and followers.
    await this.apiClient.post(`/user/${username}/block`)

    runInAction(() => {
      this.needsRefreshCommunityFeed = true
      this.communityFeed.replace(this.communityFeed.filter(cooked => cooked.username !== username))

      const followProfileData = this.profileDataMap.get(username)
      if (followProfileData) {
        followProfileData.stats['following-count']--

        // We dont really know if the blocked user is following or not, so the followers count might be incorrect.
      }
    })
  }

  async unblockUser(username) {
    await this.apiClient.delete(`/user/${username}/block`)

    this.reloadProfileCooked(username)

    runInAction(() => {
      this.needsRefreshCommunityFeed = true
    })
  }

  async loadCommunityFeed() {
    runInAction(() => {
      this.isLoadingCommunityFeed = true
    })

    try {
      const cookeds = await this.apiClient.get('/community/feed', { params: { page: 1 } })

      runInAction(() => {
        for (const cooked of cookeds) {
          this.cookedStore.saveToStore(cooked.id, cooked)
        }

        const cookedObserved = cookeds.map(cooked => {
          const observedCooked = this.cookedStore.getCooked(cooked.id)
          return observedCooked
        })

        this.communityFeed.replace(cookedObserved)
        this.hasMoreCommunityFeed = cookeds.length > 0
        this.communityFeedPage = 1
        this.needsRefreshCommunityFeed = false
        this.isRejectedCommunityFeed = false
      })
    } catch {
      runInAction(() => {
        this.isRejectedCommunityFeed = true
      })
    } finally {
      runInAction(() => {
        this.isLoadingCommunityFeed = false
      })
    }
  }

  async checkNeedsRefreshCommunityFeed() {
    const cookeds = await this.apiClient.get('/community/feed', { params: { page: 1 } })

    if (cookeds[0]?.id !== this.communityFeed[0]?.id) {
      runInAction(() => {
        this.needsRefreshCommunityFeed = true
      })
    }
  }

  async loadNextCommunityFeedPage() {
    if (!this.hasMoreCommunityFeed || this.isLoadingCommunityFeedNextPage) return

    runInAction(() => {
      this.isLoadingCommunityFeedNextPage = true
    })

    const cookeds = await this.apiClient.get('/community/feed', { params: { page: this.communityFeedPage + 1 } })

    runInAction(() => {
      if (cookeds.length === 0) {
        this.hasMoreCommunityFeed = false
      } else {
        for (const cooked of cookeds) {
          this.cookedStore.saveToStore(cooked.id, cooked)
        }
        const cookedObserved = cookeds.map(cooked => this.cookedStore.getCooked(cooked.id))

        this.communityFeed.push(...cookedObserved)
        this.communityFeedPage++
      }

      this.isLoadingCommunityFeedNextPage = false
    })
  }

  async loadProfileCooked(username) {
    const [metadata, stats, cookeds, followingResponse] = await Promise.all([
      this.apiClient.get(`/user/${username}/metadata`),
      this.apiClient.get(`/user/${username}/stats`),
      this.apiClient.get(`/user/${username}/journal`, { params: { page: 1 } }),
      this.apiClient.get('/following'),
    ])

    const usernameUserMap = new Map(followingResponse.users.map(user => [user.username, user]))

    runInAction(() => {
      this.followingUsers.replace(usernameUserMap)

      for (const cooked of cookeds) {
        this.cookedStore.saveToStore(cooked.id, cooked)
      }
      const cookedObserved = cookeds.map(cooked => this.cookedStore.getCooked(cooked.id))

      const profileData = this.profileDataMap.get(username)

      profileData.cookeds.replace(cookedObserved)
      profileData.isLoading = false
      profileData.hasMore = cookeds.length > 0
      profileData.page = 1
      profileData.bio = metadata.bio
      profileData.isPatron = metadata['is-patron?']
      profileData.imagePath = metadata['image-path']
      profileData.imageUrl = metadata['image-url']
      profileData.stats = makeAutoObservable(stats)
    })
  }

  async ensureLoadedFresh(username) {
    if (!this.profileDataMap.has(username)) {
      // If does not exist yet create it with loading state
      runInAction(() => {
        const profileData = new ProfileData()
        this.profileDataMap.set(username, profileData)
        profileData.isLoading = true
      })
    }

    // Always make sure it's up to date, even if was already loaded
    await this.loadProfileCooked(username)
  }

  async ensureLoaded(username) {
    if (!this.profileDataMap.has(username)) {
      await this.loadProfileCooked(username)
    }
  }

  async preloadProfile(username) {
    await this.ensureLoadedFresh(username)

    const profileData = this.profileDataMap.get(username)

    this.imagePreloader.preloadImageUrls([profileData.imageUrl])

    this.imagePreloader.preloadImageUrls(profileData.cookeds.flatMap(cooked => cooked['cooked-photos-urls']))
  }

  async loadCookedStats(cookedId) {
    const stats = await this.apiClient.get(`/journal/${cookedId}/stats`)

    runInAction(() => {
      this.cookedStats.set(cookedId, stats)
    })
  }

  async likeCooked(cookedId) {
    if (this.isLiked(cookedId)) {
      return
    }

    runInAction(() => {
      const stats = this.cookedStats.get(cookedId)
      if (!stats?.liked) {
        stats.liked = true
        stats['like-count']++
      }
    })

    await this.apiClient.post(`/journal/${cookedId}/stats/like`)
  }

  async unlikeCooked(cookedId) {
    runInAction(() => {
      const stats = this.cookedStats.get(cookedId)
      if (stats?.liked) {
        stats.liked = false
        stats['like-count']--
      }
    })

    await this.apiClient.delete(`/journal/${cookedId}/stats/like`)
  }

  isLiked(cookedId) {
    const stats = this.cookedStats.get(cookedId)
    return stats?.liked
  }

  async reloadProfileCooked(username) {
    this.profileDataMap.delete(username)
    await this.ensureLoadedFresh(username)
  }

  async loadNextProfileCookedsPage(username) {
    const profileData = this.profileDataMap.get(username)
    if (!profileData || !profileData.hasMore || profileData.isLoadingNextPage) return

    profileData.isLoadingNextPage = true

    const cookeds = await this.apiClient.get(`/user/${username}/journal`, {
      params: { page: profileData.page + 1 },
    })

    runInAction(() => {
      if (cookeds.length === 0) {
        profileData.hasMore = false
      } else {
        for (const cooked of cookeds) {
          this.cookedStore.saveToStore(cooked.id, cooked)
        }
        const cookedObserved = cookeds.map(cooked => this.cookedStore.getCooked(cooked.id))

        profileData.cookeds.push(...cookedObserved)
        profileData.page++
      }

      profileData.isLoadingNextPage = false
    })
  }

  getProfileStats(username) {
    return this.profileDataMap.get(username)?.stats
  }

  async updateProfileCooked(username, cookedId, newNotes, newCookedPhotosPath) {
    const updateCookedResponse = await this.apiClient.post(`/journal/${cookedId}`, {
      notes: newNotes,
      ['image-paths']: newCookedPhotosPath,
    })

    const newCooked = updateCookedResponse.cooked

    runInAction(() => {
      console.log('[updateProfileCooked] updating cooked', cookedId, newCooked)
      this.cookedStore.updateCooked(cookedId, newCooked)
    })
  }

  async recordCooked(username, recipeId, notes, cookedPhotosPath) {
    const recordCookedResponse = await this.apiClient.post(`/journal`, {
      notes: notes,
      ['recipe-id']: recipeId,
      ['image-paths']: cookedPhotosPath,
    })

    console.log('[recordCooked] recordCookedResponse:', recordCookedResponse)

    const newCooked = recordCookedResponse.cooked

    runInAction(() => {
      this.cookedStore.saveToStore(newCooked.id, newCooked)
      const observedCooked = this.cookedStore.getCooked(newCooked.id)

      const profileData = this.profileDataMap.get(username)
      if (profileData) {
        profileData.cookeds.unshift(observedCooked)
      }

      const draft = this.recipeCookedDraftStore.getDraft(recipeId)
      if (draft) {
        console.log('[recordCooked] clearing draft', recipeId)
        draft.clearNotes()
      }
    })

    return newCooked.id
  }

  deleteCooked(username, cookedId) {
    runInAction(() => {
      const profileData = this.profileDataMap.get(username)
      if (profileData) {
        const index = profileData.cookeds.findIndex(cooked => cooked.id === cookedId)
        if (index !== -1) {
          const updatedCookeds = profileData.cookeds.filter(cooked => cooked.id !== cookedId)
          profileData.cookeds.replace(updatedCookeds)
        }
      }
    })
  }

  isFollowing(username) {
    return this.followingUsers.has(username)
  }

  getProfileCookeds(username) {
    return this.profileDataMap.get(username)?.cookeds
  }

  getProfileCooked(username, cookedId) {
    return this.profileDataMap.get(username)?.cookeds.find(cooked => cooked.id === cookedId)
  }

  isLoadingProfileCookeds(username) {
    return this.profileDataMap.get(username)?.isLoading
  }

  isLoadingProfileCookedsNextPage(username) {
    return this.profileDataMap.get(username)?.isLoadingNextPage
  }

  hasMoreProfileCookeds(username) {
    return this.profileDataMap.get(username)?.hasMore
  }
}
