import { useEffect, useRef, useState, useCallback } from 'react'
import { AppState } from 'react-native'
import messaging from '@react-native-firebase/messaging'

export default function useFirebasePushNotifications({
  setNotificationToken,
  showInAppNotification,
  userEnabledNotifications,
}) {
  const [hasPermission, setHasPermission] = useState(null)

  const tokenRefreshListener = useRef()
  const foregroundMessageListener = useRef()
  const appStateListener = useRef()

  const checkPermissionStatus = useCallback(async () => {
    try {
      const authStatus = await messaging().hasPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        authStatus === messaging.AuthorizationStatus.EPHEMERAL
      setHasPermission(enabled)
      return enabled
    } catch (error) {
      console.error('Error checking notification permission:', error)
      setHasPermission(undefined)
      return false
    }
  }, [])

  useEffect(() => {
    checkPermissionStatus()

    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        checkPermissionStatus()
      }
    }

    appStateListener.current = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      if (appStateListener.current) {
        appStateListener.current.remove()
        appStateListener.current = null
      }
    }
  }, [checkPermissionStatus])

  useEffect(() => {
    if (hasPermission !== true || !userEnabledNotifications) {
      return
    }

    const setupMessaging = async () => {
      try {
        const token = await messaging().getToken()
        if (token) {
          setNotificationToken(token)
        }

        tokenRefreshListener.current = messaging().onTokenRefresh(token => {
          setNotificationToken(token)
        })

        foregroundMessageListener.current = messaging().onMessage(async remoteMessage => {
          if (remoteMessage.notification && showInAppNotification) {
            showInAppNotification({
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              data: remoteMessage.data,
            })
          }
        })
      } catch (error) {
        console.error('Error setting up messaging:', error)
      }
    }

    setupMessaging()

    return () => {
      if (tokenRefreshListener.current) {
        tokenRefreshListener.current()
        tokenRefreshListener.current = null
      }
      if (foregroundMessageListener.current) {
        foregroundMessageListener.current()
        foregroundMessageListener.current = null
      }
    }
  }, [hasPermission, setNotificationToken, showInAppNotification, userEnabledNotifications])

  const requestPermission = useCallback(async () => {
    try {
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        carPlay: true,
        provisional: true,
        announcement: true,
      })
      const allowed =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        authStatus === messaging.AuthorizationStatus.EPHEMERAL
      setHasPermission(allowed)
      return allowed
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setHasPermission(undefined)
      return false
    }
  }, [])

  const getInitialNotification = useCallback(async () => {
    const message = await messaging().getInitialNotification()
    return message
  }, [])

  const onNotificationOpenedApp = useCallback(messaging().onNotificationOpenedApp, [])

  return {
    hasPermission,
    requestPermission,
    checkPermissionStatus,
    getInitialNotification,
    onNotificationOpenedApp,
  }
}
