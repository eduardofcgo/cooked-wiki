import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getContactHashes } from '../contacts/contacts'

const defaultSettings = {
  enabledNotifications: true,
}

class UserSettings {
  settingsMap = observable.map(defaultSettings)

  loaded = false
  loading = false

  constructor() {
    makeAutoObservable(this)

    reaction(
      () => toJS(this.settingsMap),
      () => {
        if (this.loaded) {
          AsyncStorage.setItem('userSettings', JSON.stringify(this.settingsMap))
        }
      },
    )

    this.loadFromLocalStorage()
  }

  async loadFromLocalStorage() {
    runInAction(() => {
      this.loading = true
    })

    try {
      const savedSettings = await AsyncStorage.getItem('userSettings')
      runInAction(() => {
        if (savedSettings) {
          this.settingsMap.replace(JSON.parse(savedSettings))
        }
        this.loaded = true
        this.loading = false
      })
    } catch (error) {
      console.error('Error loading user settings', error)

      runInAction(() => {
        this.loaded = true
        this.loading = false
      })
    }
  }

  setEnabledNotifications(enabled) {
    this.settingsMap.set('enabledNotifications', enabled)
  }

  getEnabledNotifications() {
    if (!this.loaded) {
      return undefined
    }

    return this.settingsMap.get('enabledNotifications')
  }

  reset() {
    runInAction(() => {
      this.settingsMap.replace(defaultSettings)
    })
    AsyncStorage.removeItem('userSettings')
  }
}

export class UserStore {
  notificationToken = null
  notificationPermissionStatus = null

  contactsPermissionStatus = null

  contactHashes = null
  loadingFriendsProfiles = null
  syncedContactsHashedDate = observable.box(null)
  suggestedFriendsProfiles = null

  constructor(apiClient, onboardingStore, recentlyOpenedStore, recipeCookedDraftStore) {
    this.apiClient = apiClient
    this.recentlyOpenedStore = recentlyOpenedStore
    this.recipeCookedDraftStore = recipeCookedDraftStore
    this.onboardingStore = onboardingStore

    this.settings = new UserSettings()

    makeAutoObservable(this)

    reaction(
      () => this.notificationToken,
      async (newToken, previousToken) => {
        if (newToken && newToken != previousToken) {
          console.log('Sending new token to server', newToken)

          await this.apiClient.put('/tokens', { token: newToken })
        }
      },
    )

    reaction(
      () => this.syncedContactsHashedDate.get(),
      async syncedDate => {
        console.log('Synced contacts hashed date changed', syncedDate)

        await this.refreshSuggestedFriendsProfiles()
      },
      {
        fireImmediately: true,
      },
    )
  }

  async refreshSuggestedFriendsProfiles() {
    console.log('Refreshing suggested friends')

    runInAction(() => {
      this.loadingFriendsProfiles = true
    })

    const newSuggestedFriendsProfiles = await this.apiClient.get('/contacts/recommendations')

    runInAction(() => {
      this.suggestedFriendsProfiles = newSuggestedFriendsProfiles.users
      this.loadingFriendsProfiles = false
    })
  }

  async trySyncContacts() {
    const lastSyncDate = this.syncedContactsHashedDate.get()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (!lastSyncDate || lastSyncDate < oneDayAgo) {
      runInAction(() => {
        this.loadingFriendsProfiles = true
      })

      const newContactHashes = await getContactHashes()

      console.log('Syncing contacts', newContactHashes.length)

      if (newContactHashes.length > 0) {
        await this.apiClient.post('/contacts', { contacts: newContactHashes })

        runInAction(() => {
          this.contactHashes = newContactHashes
          this.syncedContactsHashedDate.set(new Date())
          this.loadingFriendsProfiles = false
        })
      } else {
        runInAction(() => {
          this.loadingFriendsProfiles = false
        })
      }

      console.log('Synced contacts')
    }
  }

  setNotificationToken(notificationToken) {
    this.notificationToken = notificationToken
  }

  setNotificationPermissionStatus(status) {
    this.notificationPermissionStatus = status
  }

  setContactsPermissionStatus(status) {
    this.contactsPermissionStatus = status
  }

  setLoadingFriendsProfiles() {
    this.loadingFriendsProfiles = true
  }

  async clearStores() {
    this.onboardingStore.reset()
    this.recentlyOpenedStore.clear()
    this.recipeCookedDraftStore.clear()
    this.settings.reset()
  }
}
