import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { ProfileStore } from './ProfileStore'

export default class RootStore {
  findFriendsStore
  profileStore

  constructor(apiClient) {
    this.profileStore = new ProfileStore(apiClient)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    makeAutoObservable(this)
  }
}
