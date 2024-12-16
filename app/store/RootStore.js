import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { ProfileStore } from './ProfileStore'
import { UserStore } from './UserStore'

export default class RootStore {
  userStore
  findFriendsStore
  profileStore

  constructor(apiClient) {
    this.userStore = new UserStore(apiClient)
    this.profileStore = new ProfileStore(apiClient)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    makeAutoObservable(this)
  }
}
