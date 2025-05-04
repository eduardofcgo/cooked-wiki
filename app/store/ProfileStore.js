import { makeAutoObservable, observable, runInAction } from 'mobx'

class ProfileData {
  cookeds = observable.array()
  isLoading = false
  isLoadingNextPage = false
  page = 1
  hasMore = true

  stats = undefined
  isLoadingStats = false

  bio = undefined

  constructor() {
    makeAutoObservable(this)
  }
}

export class ProfileStore {
  followingUsernames = observable.set()

  communityFeed = observable.array()

  isLoadingCommunityFeed = undefined
  isLoadingCommunityFeedNextPage = false
  communityFeedPage = 1
  hasMoreCommunityFeed = true

  needsRefreshCommunityFeed = false

  profileDataMap = observable.map()

  cookedStats = observable.map()

  constructor(apiClient, cookedStore) {
    this.apiClient = apiClient
    this.cookedStore = cookedStore

    makeAutoObservable(this)
  }

  getBio(username) {
    return this.profileDataMap.get(username)?.bio
  }

  isPatron(username) {
    return this.profileDataMap.get(username)?.isPatron === true
  }

  getImagePath(username) {
    return this.profileDataMap.get(username)?.imagePath
  }

  async updateProfileImage(username, file) {
    const formData = new FormData()
    formData.append('profile-image', file)

    const response = await this.apiClient.request({
      url: `/user/profile/image`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => formData,
      data: formData,
    })

    const imagePath = response['image-path']

    runInAction(() => {
      this.profileDataMap.get(username).imagePath = imagePath
    })
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
    await this.apiClient.put('/following', { username })

    runInAction(() => {
      // Not the best, but this way we ensure that the followed username
      // is added at the beginning of the set.
      this.followingUsernames.replace(new Set([username, ...this.followingUsernames]))

      const followProfileData = this.profileDataMap.get(username)
      if (followProfileData) {
        followProfileData.stats['followers-count']++
      }
    })
  }

  async unfollow(username) {
    await this.apiClient.delete('/following', { data: { username } })

    runInAction(() => {
      this.followingUsernames.delete(username)

      const followProfileData = this.profileDataMap.get(username)
      if (followProfileData) {
        followProfileData.stats['followers-count']--
      }
    })
  }

  async loadFollowing() {
    const { users } = await this.apiClient.get('/following')

    runInAction(() => {
      const usernames = users.map(user => user.username)
      this.followingUsernames.replace(usernames)
    })
  }

  async loadCommunityFeed() {
    runInAction(() => {
      this.isLoadingCommunityFeed = true
    })

    const cookeds = await this.apiClient.get('/community/feed', { params: { page: 1 } })

    runInAction(() => {
      for (const cooked of cookeds) {
        this.cookedStore.saveToStore(cooked.id, cooked)
      }

      const cookedObserved = cookeds.map(cooked => {
        const observedCooked = this.cookedStore.getCooked(cooked.id)
        return observedCooked
      })

      console.log('[loadCommunityFeed] wow', cookedObserved)

      this.communityFeed.replace(cookedObserved)
      this.isLoadingCommunityFeed = false
      this.hasMoreCommunityFeed = cookeds.length > 0
      this.communityFeedPage = 1
      this.needsRefreshCommunityFeed = false
    })
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
    runInAction(() => {
      this.profileDataMap.delete(username)

      const profileData = new ProfileData()
      this.profileDataMap.set(username, profileData)
      profileData.isLoading = true
    })

    const [metadata, cookeds] = await Promise.all([
      this.apiClient.get(`/user/${username}/metadata`),
      this.apiClient.get(`/user/${username}/journal`, { params: { page: 1 } }),
    ])

    runInAction(() => {
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
    })
  }

  async getFollowingUsernames(username) {
    // Since it's not edited by the logged in user, there is no need to react to changes.
    // TODO: move to a hook
    const { users } = await this.apiClient.get(`/user/${username}/following`)
    return users.map(user => user.username)
  }

  async getFollowersUsernames(username) {
    // Since it's not edited by the logged in user, there is no need to react to changes.
    // TODO: move to a hook
    const { users } = await this.apiClient.get(`/user/${username}/followers`)
    return users.map(user => user.username)
  }

  async loadCookedStats(cookedId) {
    const stats = await this.apiClient.get(`/journal/${cookedId}/stats`)

    runInAction(() => {
      this.cookedStats.set(cookedId, stats)
    })
  }

  async likeCooked(cookedId) {
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

  async reloadProfileCooked(username) {
    this.profileDataMap.delete(username)
    this.cookedStats.clear()
    await Promise.all([this.loadProfileCooked(username), this.loadProfileStats(username)])
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

  async loadProfileStats(username) {
    let profileData = this.profileDataMap.get(username)
    if (!profileData) {
      profileData = new ProfileData()
      this.profileDataMap.set(username, profileData)
    } else if (profileData.stats) {
      return
    }

    profileData.isLoadingStats = true

    const stats = await this.apiClient.get(`/user/${username}/stats`)

    runInAction(() => {
      profileData.stats = stats
      profileData.isLoadingStats = false
    })
  }

  getProfileStats(username) {
    return this.profileDataMap.get(username)?.stats
  }

  isLoadingProfileStats(username) {
    return this.profileDataMap.get(username)?.isLoadingStats
  }

  async uploadProfileCookedPhoto(cookedId, file) {
    // TODO: move to the client
    const formData = new FormData()
    formData.append('cooked-photo', file)

    const response = await this.apiClient.request({
      url: `/journal/${cookedId}/upload`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => formData,
      uploadProgress: progressEvent => {},
      data: formData,
    })

    return response['image-path']
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
    })

    return newCooked.id
  }

  isFollowing(username) {
    return this.followingUsernames.has(username)
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
