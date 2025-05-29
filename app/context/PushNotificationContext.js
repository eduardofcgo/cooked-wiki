import { createContext, useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from './StoreContext'
import useFirebasePushNotifications from '../hooks/useFirebasePushNotifications'
import { useInAppNotification } from './NotificationContext'

const PushNotificationContext = createContext()

export function usePushNotification() {
  const context = useContext(PushNotificationContext)
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider')
  }

  return context
}

export const PushNotificationProvider = observer(function PushNotificationProvider({ children }) {
  const { userStore } = useStore()
  const enabledNotifications = userStore.settings.getEnabledNotifications()

  const inAppNotification = useInAppNotification()

  const setNotificationToken = useCallback(
    token => {
      userStore.setNotificationToken(token)
    },
    [userStore],
  )

  const showInAppNotification = useCallback(
    notification => {
      //inAppNotification.showInAppNotification(notification)
    },
    [inAppNotification],
  )

  const value = useFirebasePushNotifications({
    setNotificationToken,
    showInAppNotification,
    userEnabledNotifications: enabledNotifications,
  })

  return <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
})
