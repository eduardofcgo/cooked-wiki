import { makeAutoObservable, runInAction, reaction, observable } from 'mobx'

export class ProfileStore {
  followingUsernames = observable.set()
  isLoadingFollowing = false

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
    const { users } = await this.apiClient.get('/following')
    runInAction(() => {
      const usernames = users.map(user => user.username)
      this.followingUsernames.replace(usernames)
    })
  }

  isFollowing(username) {
    return this.followingUsernames.has(username)
  }
}
