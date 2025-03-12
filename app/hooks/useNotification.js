import * as Notifications from 'expo-notifications'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { registerPushNotificationToken } from '../notifications/push'

export default function useNotification({ notificationPermissionStatus, setNotificationToken, showNotification }) {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    })
  }, [])

  const [channels, setChannels] = useState([])

  const notificationListener = useRef()
  const responseListener = useRef()
  const tokenListener = useRef()

  useEffect(() => {
    if (notificationPermissionStatus === 'granted') {
      registerPushNotificationToken().then(token => {
        if (token) {
          setNotificationToken(token)
        }

        tokenListener.current = Notifications.addPushTokenListener(token => {
          setNotificationToken(token.data)
        })

        if (Platform.OS === 'android') {
          Notifications.getNotificationChannelsAsync().then(notificationChannels => {
            setChannels(notificationChannels ?? [])
          })
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          showNotification(notification)
        })

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response)
        })

        return () => {
          notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current)
          responseListener.current && Notifications.removeNotificationSubscription(responseListener.current)
          tokenListener.current && Notifications.removeNotificationSubscription(tokenListener.current)
        }
      })
    }
  }, [notificationPermissionStatus])
}
