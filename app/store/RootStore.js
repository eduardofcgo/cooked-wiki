import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { ProfileStore } from './ProfileStore'
import { UserStore } from './UserStore'
import { RecentlyOpenedStore } from './RecentlyOpenedStore'
import { RecipeMetadataStore } from './RecipeMetadataStore'

export default class RootStore {
  userStore
  findFriendsStore
  profileStore
  recentlyOpenedStore
  recipeMetadataStore

  constructor(apiClient) {
    this.userStore = new UserStore(apiClient)
    this.profileStore = new ProfileStore(apiClient)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    this.recentlyOpenedStore = new RecentlyOpenedStore()
    this.recipeMetadataStore = new RecipeMetadataStore(apiClient)

    makeAutoObservable(this)
  }
}
