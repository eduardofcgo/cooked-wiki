import { makeAutoObservable, runInAction, reaction, observable } from 'mobx'

import { getContactHashes } from '../contacts/contacts'


export class UserStore {
  notificationToken = null
  notificationPermissionStatus = null
  enabledNotifications = true

  hiddenNotificationsCard = false
  hiddenFindFriendsCard = false

  contactsPermissionStatus = null

  contactHashes = null
  loadingFriendsProfiles = null
  syncedContactsHashedDate = observable.box(null)
  suggestedFriendsProfiles = null

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)

    reaction(
      () => this.notificationToken,
      async (newToken, previousToken) => {
        if (newToken) {
          console.log('Sending new token to server', newToken)

          await this.apiClient.put('/tokens', { token: newToken })
        }
      }
    )

    reaction(
      () => this.syncedContactsHashedDate.get(),
      async syncedDate => {
        console.log('Synced contacts hashed date changed', syncedDate)

        await this.refreshSuggestedFriendsProfiles()
      },
      {
        fireImmediately: true,
      }
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

  hideNotificationsCard() {
    this.hiddenNotificationsCard = true
  }

  hideFindFriendsCard() {
    this.hiddenFindFriendsCard = true
  }
}
