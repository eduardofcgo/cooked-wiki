import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import MainMenu from '../components/navigation/MainMenu'
import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'
import useNotification from '../hooks/useNotification'

function Main() {
  const { userStore } = useStore()
  const { showInAppNotification } = useInAppNotification()

  const setNotificationToken = useCallback(
    token => {
      userStore.setNotificationToken(token)
    },
    [userStore],
  )

  const showNotification = useCallback(
    notification => {
      console.log('notification', notification)
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
