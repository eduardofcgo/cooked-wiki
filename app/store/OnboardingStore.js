import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'

export class OnboardingStore {
  // Let's make this dynamic because new versions of the app will have
  // new onboarding UI - we don't want to have to clear the local storage.
  onboardingState = observable.map({
    shownRecentRecipesHint: false,
    shownFindFriendsHint: false,
  })

  loaded = false
  loading = false

  constructor() {
    makeAutoObservable(this)

    reaction(
      () => toJS(this.onboardingState),
      () => {
        AsyncStorage.setItem('onboardingState', JSON.stringify(this.onboardingState))
      }
    )

    this.loadFromLocalStorage()
  }

  async saveToLocalStorage() {}

  async loadFromLocalStorage() {
    runInAction(() => {
      this.loading = true
    })
    try {
      const savedState = await AsyncStorage.getItem('onboardingState')
      runInAction(() => {
        if (savedState) {
          this.onboardingState.replace(JSON.parse(savedState))
        }
        this.loaded = true
        this.loading = false
      })
    } catch (error) {
      console.error('Error loading onboarding state', error)

      runInAction(() => {
        this.loaded = true
        this.loading = false
      })
    }
  }

  markRecentRecipesHintAsShown() {
    this.onboardingState.set('shownRecentRecipesHint', true)
  }

  showFindFriendsHint() {
    return !this.onboardingState.get('shownFindFriendsHint')
  }

  markFindFriendsHintAsShown() {
    this.onboardingState.set('shownFindFriendsHint', true)
  }
}
