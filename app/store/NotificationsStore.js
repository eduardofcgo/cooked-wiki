import { makeAutoObservable, observable } from 'mobx'

export class NotificationsStore {
  notifications = observable.array([])
  hasNewNotifications = false

  loading = false

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)

    reaction(
      () => this.hasNewNotifications,
      () => {
        AsyncStorage.setItem('hasNewNotifications', JSON.stringify(this.hasNewNotifications))
      }
    )

    this.loadHasNewNotificationsFromLocalStorage()
  }

  async loadHasNewNotificationsFromLocalStorage() {
    const hasNewNotifications = await AsyncStorage.getItem('hasNewNotifications')
    runInAction(() => {
      this.hasNewNotifications = JSON.parse(hasNewNotifications)
    })
  }

  async loadNotifications() {
    const newNotifications = await this.apiClient.get('/notifications')
    const latestNotification = newNotifications[0]
    const updatedNotifications = latestNotification?.id != this.notifications[0]?.id

    runInAction(() => {
      if (updatedNotifications) {
        this.notifications.replace(notifications)
        this.hasNewNotifications = true
      }
    })
  }

  hasNewNotifications() {
    return this.notifications.length > 0
  }
}
