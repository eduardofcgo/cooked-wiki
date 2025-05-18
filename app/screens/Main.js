import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import MainMenu from '../components/navigation/MainMenu'
import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import useNotification from '../hooks/useNotification'

function Main() {
  const { userStore, profileStore } = useStore()
  const { credentials } = useAuth()
  const { showInAppNotification } = useInAppNotification()

  // Preload user profile
  useEffect(() => {
    try {
      if (credentials?.username) {
        profileStore.preloadProfile(credentials.username)
      }
    } catch (error) {
      console.error('Error preloading profile', error)
    }
  }, [credentials?.username, profileStore])

  const setNotificationToken = useCallback(
    token => {
      userStore.setNotificationToken(token)
    },
    [userStore],
  )

  const showNotification = useCallback(
    notification => {
      console.log('notification', notification)
      // TODO: Show notification
      // showInAppNotification(notification)
    },
    [showInAppNotification],
  )

  const notificationPermissionStatus = userStore.notificationPermissionStatus

  useNotification({
    notificationPermissionStatus,
    setNotificationToken,
    showNotification,
  })

  return <MainMenu />
}

export default observer(Main)
