import { makeAutoObservable, observable, runInAction } from 'mobx'

class ProfileData {
  cookeds = observable.array()
  isLoading = false
  isLoadingNextPage = false
  page = 1
  hasMore = true

  stats = undefined
  isLoadingStats = false

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

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)
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
      this.communityFeed.replace(cookeds)
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

    this.isLoadingCommunityFeedNextPage = true

    const cookeds = await this.apiClient.get('/community/feed', { params: { page: this.communityFeedPage + 1 } })

    runInAction(() => {
      if (cookeds.length === 0) {
        this.hasMoreCommunityFeed = false
      } else {
        this.communityFeed.push(...cookeds)
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

    const cookeds = await this.apiClient.get(`/user/${username}/journal`, { params: { page: 1 } })

    runInAction(() => {
      const profileData = this.profileDataMap.get(username)

      profileData.cookeds.replace(cookeds)
      profileData.isLoading = false
      profileData.hasMore = cookeds.length > 0
      profileData.page = 1
    })
  }

  async getFollowingUsernames(username) {
    // Since it's not edited by the logged in user, there is no need to react to changes.
    // So for now let's not save this in the store, and request everytime it's needed.
    const { users } = await this.apiClient.get(`/user/${username}/following`)
    return users.map(user => user.username)
  }

  async getFollowersUsernames(username) {
    // Since it's not edited by the logged in user, there is no need to react to changes.
    // So for now let's not save this in the store, and request everytime it's needed.
    const { users } = await this.apiClient.get(`/user/${username}/followers`)
    return users.map(user => user.username)
  }

  async getCooked(username, cookedId) {
    const cooked = this.profileDataMap.get(username)?.cookeds.find(cooked => cooked.id === cookedId)
    if (cooked) return cooked

    const fetchedCooked = await this.apiClient.get(`/journal/${cookedId}`)

    return fetchedCooked
  }

  async loadCookedStats(cookedId) {
    const stats = await this.apiClient.get(`/journal/${cookedId}/stats`)

    runInAction(() => {
      this.cookedStats.set(cookedId, stats)
    })
  }

  async likeCooked(cookedId) {
    await this.apiClient.post(`/journal/${cookedId}/stats/like`)

    runInAction(() => {
      const stats = this.cookedStats.get(cookedId)
      if (stats) {
        stats.liked = true
        stats['like-count']++
      }
    })
  }

  async unlikeCooked(cookedId) {
    await this.apiClient.delete(`/journal/${cookedId}/stats/like`)

    runInAction(() => {
      const stats = this.cookedStats.get(cookedId)
      if (stats) {
        stats.liked = false
        stats['like-count']--
      }
    })
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
        profileData.cookeds.push(...cookeds)
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
    const newCooked = await this.apiClient.post(`/journal/${cookedId}`, {
      notes: newNotes,
      ['image-paths']: newCookedPhotosPath,
    })

    const profileData = this.profileDataMap.get(username)

    if (profileData) {
      const index = profileData.cookeds.findIndex(cooked => cooked.id === cookedId)
      if (index !== -1) {
        runInAction(() => {
          profileData.cookeds[index] = {
            ...profileData.cookeds[index],
            notes: newCooked.notes,
            ['cooked-photos-path']: newCooked['image-paths'],
          }
        })
      }
    }
  }

  isFollowing(username) {
    return this.followingUsernames.has(username)
  }

  getProfileCookeds(username) {
    return this.profileDataMap.get(username)?.cookeds
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
