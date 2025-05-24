import { makeAutoObservable, observable, reaction, runInAction } from 'mobx'

import { getContactHashes } from '../contacts/contacts'

export class UserStore {
  notificationToken = null
  notificationPermissionStatus = null
  enabledNotifications = true

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

  setEnabledNotifications(enabled) {
    this.enabledNotifications = enabled
  }

  setLoadingFriendsProfiles() {
    this.loadingFriendsProfiles = true
  }

  async clearStores() {
    this.onboardingStore.reset()
    this.recentlyOpenedStore.clear()
    this.recipeCookedDraftStore.clear()
  }
}
