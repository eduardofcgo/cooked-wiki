import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { ShareIntentModule, getScheme, getShareExtensionKey } from 'expo-share-intent'
import { getStateFromPath } from '@react-navigation/native'

const PREFIX = Linking.createURL('/')
const PACKAGE_NAME = Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier

const formatNotificationUrl = url => {
  if (!url) return null

  if (url.includes('://')) {
    return url
  }

  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  return `${Constants.expoConfig?.scheme}://${cleanPath}`
}

export default ({ getInitialNotification, onNotificationOpenedApp }) => ({
  prefixes: [`${Constants.expoConfig?.scheme}://`, `${PACKAGE_NAME}://`, PREFIX],

  config: {
    initialRouteName: 'Main',
    screens: {
      Generate: 'generate',
      ShareIntentNewExtract: 'share-generate',
      PublicProfile: 'user/:username',
      Cooked: 'cooked/:cookedId',
      Main: {
        screens: {
          Community: 'community',
        },
      },
    },
  },

  // see: https://reactnavigation.org/docs/configuring-links/#advanced-cases
  getStateFromPath(path, config) {
    // Share intent when app was killed
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      return {
        routes: [
          {
            name: 'Main',
          },
          {
            name: 'ShareIntentNewExtract',
          },
        ],
      }
    }

    return getStateFromPath(path, config)
  },

  subscribe(listener) {
    const onReceiveURL = ({ url }) => {
      if (url.includes(getShareExtensionKey())) {
        // Share intent when app is in background
        listener(`${getScheme()}://share-generate`)
      } else {
        listener(url)
      }
    }

    const shareIntentStateSubscription = ShareIntentModule?.addListener('onStateChange', event => {
      // Share intent when app is in background (Android)
      if (event.value === 'pending') {
        listener(`${getScheme()}://share-generate`)
      }
    })

    const shareIntentValueSubscription = ShareIntentModule?.addListener('onChange', async event => {
      // Share intent when app is in background (iOS)
      const url = await getInitialURL()
      if (url) {
        onReceiveURL({ url })
      }
    })

    const urlEventSubscription = Linking.addEventListener('url', onReceiveURL)

    // User clicks notification when app is in the background
    const notificationOpenedUnsubscribe = onNotificationOpenedApp(message => {
      if (message?.data?.url) {
        const formattedUrl = formatNotificationUrl(message.data.url)
        if (formattedUrl) {
          listener(formattedUrl)
        }
      }
    })

    // Expo notifications - User clicks local notification when app is in the foreground
    const expoNotificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data
      if (notificationData?.foreground && notificationData?.url) {
        const formattedUrl = formatNotificationUrl(notificationData.url)
        if (formattedUrl) {
          listener(formattedUrl)
        }
      }
    })

    return () => {
      shareIntentStateSubscription?.remove()
      shareIntentValueSubscription?.remove()
      urlEventSubscription.remove()
      notificationOpenedUnsubscribe()
      expoNotificationResponseSubscription.remove()
    }
  },

  // https://reactnavigation.org/docs/deep-linking/#third-party-integrations
  async getInitialURL() {
    const url = await Linking.getInitialURL()

    if (typeof url === 'string') {
      return url
    }

    // User clicks notification when app is in the foreground
    const message = await getInitialNotification()
    if (message?.data?.url) {
      const formattedUrl = formatNotificationUrl(message.data.url)
      if (formattedUrl) {
        return formattedUrl
      }
    }

    return url
  },
})
