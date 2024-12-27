import { makeAutoObservable, runInAction, reaction, observable } from 'mobx'

export class ProfileStore {
  followingUsernames = observable.set()
  isLoadingFollowing = false

  communityFeed = observable.array()
  isLoadingCommunityFeed = undefined
  isLoadingCommunityFeedNextPage = false
  communityFeedPage = 1
  hasMoreCommunityFeed = true

  profileCookeds = observable.array()
  isLoadingProfileCookeds = undefined
  isLoadingProfileCookedNextPage = false
  profileCookedsPage = 1
  hasMoreProfileCookeds = true

  profileStats = undefined
  isLoadingProfileStats = false

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)
  }

  async follow(username) {
    await this.apiClient.put('/following', { username })

    runInAction(() => {
      this.followingUsernames.add(username)
    })
  }

  async unfollow(username) {
    await this.apiClient.delete('/following', { data: { username } })

    runInAction(() => {
      this.followingUsernames.delete(username)
    })
  }

  async loadFollowing() {
    this.isLoadingFollowing = true

    const { users } = await this.apiClient.get('/following')
    runInAction(() => {
      const usernames = users.map(user => user.username)
      this.followingUsernames.replace(usernames)
      this.isLoadingFollowing = false
    })
  }

  async loadCommunityFeed() {
    this.isLoadingCommunityFeed = true

    const cookeds = await this.apiClient.get('/community/feed', { params: { page: 1 } })
    
    runInAction(() => {
      this.communityFeed.replace(cookeds)
      this.isLoadingCommunityFeed = false
      this.hasMoreCommunityFeed = cookeds.length > 0
      this.communityFeedPage = 1
    })
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
    this.isLoadingProfileCookeds = true

    const cookeds = await this.apiClient.get(`/user/${username}/journal`, { params: { page: 1 } })
    
    runInAction(() => {
      this.profileCookeds.replace(cookeds)
      this.isLoadingProfileCookeds = false
      this.hasMoreProfileCookeds = cookeds.length > 0
      this.profileCookedsPage = 1
    })
  }

  async loadNextProfileCookedsPage(username) {
    if (!this.hasMoreProfileCookeds || this.isLoadingProfileCookedsNextPage) return

    this.isLoadingProfileCookedsNextPage = true

    const cookeds = await this.apiClient.get(`/user/${username}/journal`, { params: { page: this.profileCookedsPage + 1 } })
    
    runInAction(() => {
      if (cookeds.length === 0) {
        this.hasMoreProfileCookeds = false
      } else {
        this.profileCookeds.push(...cookeds)
        this.profileCookedsPage++
      }

      this.isLoadingProfileCookedsNextPage = false
    })
  }

  async loadProfileStats(username) {
    this.isLoadingProfileStats = true

    const stats = await this.apiClient.get(`/user/${username}/stats`)
   
    runInAction(() => {
      this.profileStats = stats
      this.isLoadingProfileStats = false
    })
  }

  updateCooked(cookedId, cooked) {
    const cookedIndex = this.communityFeed.findIndex(cooked => cooked.id === cookedId)
    if (cookedIndex !== -1) {
      this.communityFeed[cookedIndex] = {
        ...this.communityFeed[cookedIndex],
        ...cooked
      }
    }

    // TODO: Update cooked in the server
  }

  isFollowing(username) {
    return this.followingUsernames.has(username)
  }
}
