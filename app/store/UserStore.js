import { makeAutoObservable, runInAction, reaction, observable } from 'mobx'

export class UserStore {
  notificationToken = null
  notificationPermissionStatus = null
  enabledNotifications = true

  contactsPermissionStatus = null
  showFindFriendsCard = true

  contactHashes = null
  loadingFriendsProfiles = null
  syncedContactsHashedDate = null
  suggestedFriendsProfiles = null

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)

    reaction(
      () => this.notificationToken,
      async (newToken, previousToken) => {
        console.log('notificationToken', newToken)
      }
    )

    reaction(
      () => this.contacts,
      async newContactHashes => {
        if (newContactHashes.length > 0) {
          this.syncedContactsHashedDate = new Date()

          console.log('new contacts')
        }
      }
    )
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

  setContactsHashes(contactHashes) {
    this.contactHashes = contactHashes
  }
}
