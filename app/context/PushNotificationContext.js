import { createContext, useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import * as Notifications from 'expo-notifications'
import { useStore } from './StoreContext'
import useFirebasePushNotifications from '../hooks/useFirebasePushNotifications'

// Configure how notifications are presented when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const PushNotificationContext = createContext()

export function usePushNotification() {
  const context = useContext(PushNotificationContext)
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider')
  }

  return context
}

export const PushNotificationProvider = observer(function ({ children }) {
  const { userStore, notificationsStore } = useStore()
  const enabledNotifications = userStore.settings.getEnabledNotifications()

  const setNotificationToken = useCallback(
    token => {
      userStore.setNotificationToken(token)
    },
    [userStore],
  )

  const showInAppNotification = useCallback(
    async notification => {
      notificationsStore.refreshNotifications()

      // For now lets just show a native notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null,
      })
    },
    [notificationsStore],
  )

  // Test function to trigger a local notification banner
  const testNotificationBanner = useCallback(async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This should appear as a banner at the top',
        data: { test: true },
      },
      trigger: null,
    })
  }, [])

  const value = useFirebasePushNotifications({
    setNotificationToken,
    showInAppNotification,
    userEnabledNotifications: enabledNotifications,
  })

  return (
    <PushNotificationContext.Provider value={{ ...value, testNotificationBanner }}>
      {children}
    </PushNotificationContext.Provider>
  )
})
