import { makeAutoObservable } from 'mobx'

import { FindFriendsStore } from './FindFriendsStore'
import { OnboardingStore } from './OnboardingStore'
import { ProfileStore } from './ProfileStore'
import { RecentlyOpenedStore } from './RecentlyOpenedStore'
import { RecipeMetadataStore } from './RecipeMetadataStore'
import { UserStore } from './UserStore'
import { RecipeJournalStore } from './RecipeJournalStore'
import { CookedStore } from './CookedStore'
import { NotificationsStore } from './NotificationsStore'
import { ImagePreloader } from './ImagePreloader'

export default class RootStore {
  userStore
  onboardingStore
  findFriendsStore
  profileStore
  recentlyOpenedStore
  recipeMetadataStore

  constructor(apiClient) {
    this.imagePreloader = new ImagePreloader(apiClient)

    this.onboardingStore = new OnboardingStore()

    this.userStore = new UserStore(apiClient)

    this.cookedStore = new CookedStore(apiClient, this.imagePreloader)

    this.profileStore = new ProfileStore(apiClient, this.imagePreloader, this.cookedStore)
    this.findFriendsStore = new FindFriendsStore(apiClient, this.profileStore)

    this.recipeMetadataStore = new RecipeMetadataStore(apiClient, this.imagePreloader)

    this.recentlyOpenedStore = new RecentlyOpenedStore(this.recipeMetadataStore)

    this.recipeJournalStore = new RecipeJournalStore(apiClient, this.profileStore, this.cookedStore)

    this.notificationsStore = new NotificationsStore(apiClient, this.profileStore, this.cookedStore)

    makeAutoObservable(this)
  }
}
