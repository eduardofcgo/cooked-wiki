import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { OnboardingStore } from './OnboardingStore'
import { ProfileStore } from './ProfileStore'
import { RecentlyOpenedStore } from './RecentlyOpenedStore'
import { RecipeMetadataStore } from './RecipeMetadataStore'
import { UserStore } from './UserStore'

export default class RootStore {
  userStore
  onboardingStore
  findFriendsStore
  profileStore
  recentlyOpenedStore
  recipeMetadataStore

  constructor(apiClient) {
    this.userStore = new UserStore(apiClient)

    this.onboardingStore = new OnboardingStore()

    this.profileStore = new ProfileStore(apiClient)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    this.recentlyOpenedStore = new RecentlyOpenedStore()
    this.recipeMetadataStore = new RecipeMetadataStore(apiClient)

    makeAutoObservable(this)
  }
}
