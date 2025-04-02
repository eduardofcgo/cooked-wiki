import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import MainMenu from '../components/navigation/MainMenu'
import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'
import useNotification from '../hooks/useNotification'
import { StatusBar } from 'react-native'
import { theme } from '../style/style'

function Main() {
  const { userStore } = useStore()
  const { showInAppNotification } = useInAppNotification()

  useEffect(() => { 
    StatusBar.setBackgroundColor(theme.colors.secondary, true)
  }, [])
  
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
