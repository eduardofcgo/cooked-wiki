import { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/StoreContext'
import BottomMenu from '../components/navigation/BottomMenu'
import { registerPushNotificationToken } from '../notifications/push'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function Main() {
  const { userStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus

  const [channels, setChannels] = useState([])
  const [notification, setNotification] = useState(undefined)

  const notificationListener = useRef()
  const responseListener = useRef()
  const tokenListener = useRef()

  useEffect(() => {
    if (notificationPermissionStatus === 'granted') {
      registerPushNotificationToken().then(token => {
        if (token) {
          userStore.setNotificationToken(token)
        }

        tokenListener.current = Notifications.addPushTokenListener(token => {
          userStore.setNotificationToken(token.data)
        })

        if (Platform.OS === 'android') {
          Notifications.getNotificationChannelsAsync().then(notificationChannels => {
            setChannels(notificationChannels ?? [])
          })
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification)
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

  return <BottomMenu />
}

export default observer(Main)
