import { makeAutoObservable, observable, runInAction, reaction } from 'mobx'
import { fromPromise } from 'mobx-utils'

export class NotificationsStore {
  notifications = undefined

  constructor(apiClient, profileStore, cookedStore) {
    this.apiClient = apiClient
    this.profileStore = profileStore
    this.cookedStore = cookedStore

    makeAutoObservable(this)

    reaction(
      () => this.notifications?.state,
      state => {
        if (state === 'fulfilled') {
          this.preloadProfiles()
          this.preloadCooks()
        }
      },
    )
  }

  preloadProfiles() {
    const notifications = this.getNotifications()

    if (notifications?.length > 0) {
      notifications.slice(0, 10).forEach(notification => {
        if (notification.username) {
          this.profileStore.preloadProfile(notification.username)
        }
      })
    }
  }

  preloadCooks() {
    const notifications = this.getNotifications()

    if (notifications?.length > 0) {
      notifications.slice(0, 10).forEach(notification => {
        if (notification['cooked-id']) {
          this.cookedStore.preloadCooked(notification['cooked-id'])
        }
      })
    }
  }

  getNotifications() {
    return this.notifications?.value
  }

  get hasNewNotifications() {
    return this.notificationsUnreadCount > 0
  }

  get notificationsUnreadCount() {
    if (this.getNotificationsLoadState() === 'rejected') {
      return undefined
    }

    return this.getNotifications()?.filter(notification => !notification['is-read']).length
  }

  getNotificationsLoadState() {
    return this.notifications?.state
  }

  async markNotificationAsRead(notificationId) {
    try {
      // Let's be optimistic
      runInAction(() => {
        if (this.getNotifications()) {
          for (const notification of this.getNotifications()) {
            if (notification.id === notificationId) {
              notification['is-read'] = true
            }
          }
        }
      })

      await this.apiClient.post(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async markAllNotificationsAsRead() {
    try {
      // Let's be optimistic
      runInAction(() => {
        if (this.getNotifications()) {
          for (const notification of this.getNotifications()) {
            notification['is-read'] = true
          }
        }
      })

      await this.apiClient.post('/notifications/read-all')
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  refreshNotifications() {
    this.loadNotifications()
  }

  loadNotifications() {
    runInAction(() => {
      this.notifications = fromPromise(
        this.apiClient
          .get('/notifications')
          .then(response => response.notifications)
          .then(notifications => notifications.map(notification => makeAutoObservable(notification)))
          .then(observable.array),

        this.notifications,
      )
    })
  }
}
