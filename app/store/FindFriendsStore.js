import { makeAutoObservable, runInAction, reaction, toJS, observable } from 'mobx'

export class FindFriendsStore {
  users = observable.array([])
  loading = false
  searchQuery = ''

  constructor(apiClient, profileStore) {
    this.apiClient = apiClient
    this.profileStore = profileStore

    makeAutoObservable(this)

    reaction(
      () => toJS(this.profileStore.followingUsernames),
      followingUsernames => {
        for (const user of this.users) {
          user['is-following'] = followingUsernames.has(user.username)
        }
      }
    )

    reaction(
      () => this.searchQuery,
      query => {
        if (query.trim()) {
          this.searchUsers(query)
        }
      },
      { delay: 300 }
    )
  }

  get isEmptySearch() {
    return !this.searchQuery.trim()
  }

  setSearchQuery(query) {
    this.searchQuery = query
  }

  resetSearch() {
    this.searchQuery = ''
  }

  async searchUsers(query) {
    try {
      this.loading = true
      const { users } = await this.apiClient.get('/following/search', { params: { query } })

      runInAction(() => {
        this.users = users.map(user => observable(user))
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.users.clear()
        this.loading = false
      })
      console.error('Search users error:', error)
    }
  }

  async follow(username) {
    await this.profileStore.follow(username)
  }

  async unfollow(username) {
    await this.profileStore.unfollow(username)
  }
}
