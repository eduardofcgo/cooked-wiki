import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

export async function requestPushNotificationsPermission() {
  if (!Device.isDevice) {
    throw new Error('Must use physical device for Push Notifications')
  }

  const currentPermission = await Notifications.getPermissionsAsync()

  if (currentPermission.status !== 'granted') {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    return await Notifications.requestPermissionsAsync()
  }

  return currentPermission
}

export async function registerPushNotificationToken() {
  const currentPermission = await Notifications.getPermissionsAsync()

  if (currentPermission.status !== 'granted') {
    throw new Error('No push notification permission')
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
  if (!projectId) {
    throw new Error('Project ID not found for creating push notification token')
  }

  const { data: token } = await Notifications.getDevicePushTokenAsync({ projectId })

  return token
}
