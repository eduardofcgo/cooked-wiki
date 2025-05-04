import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { OnboardingStore } from './OnboardingStore'
import { ProfileStore } from './ProfileStore'
import { RecentlyOpenedStore } from './RecentlyOpenedStore'
import { RecipeMetadataStore } from './RecipeMetadataStore'
import { UserStore } from './UserStore'
import { RecipeJournalStore } from './RecipeJournalStore'
import { CookedStore } from './CookedStore'

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

    this.cookedStore = new CookedStore(apiClient)

    this.profileStore = new ProfileStore(apiClient, this.cookedStore)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    this.recipeMetadataStore = new RecipeMetadataStore(apiClient)

    this.recentlyOpenedStore = new RecentlyOpenedStore(this.recipeMetadataStore)

    this.recipeJournalStore = new RecipeJournalStore(apiClient, this.profileStore, this.cookedStore)

    makeAutoObservable(this)
  }
}
