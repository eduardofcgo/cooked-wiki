import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { ShareIntentModule, getScheme, getShareExtensionKey } from 'expo-share-intent'
import { LinkingOptions, NavigationContainer, NavigationContainerRef, getStateFromPath } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const PREFIX = Linking.createURL('/')
const PACKAGE_NAME = Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier

export default {
  prefixes: [
    `${Constants.expoConfig?.scheme}://`,
    `${PACKAGE_NAME}://`,
    PREFIX,
    //'https://cooked.wiki'
  ],
  // TODO: exclude user login urls etc
  //filter: (url) => !url.includes('+expo-auth-session'),
  config: {
    initialRouteName: 'Main',
    screens: {
      Extract: 'extract',
      Main: {
        screens: {
          Community: 'community',
          Profile: 'recipes',
          ShoppingList: 'buy',
        },
      },
    },
  },

  // see: https://reactnavigation.org/docs/configuring-links/#advanced-cases
  getStateFromPath(path, config) {
    // REQUIRED FOR iOS FIRST LAUNCH
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      // redirect to the ShareIntent Screen to handle data with the hook
      console.debug('react-navigation[getStateFromPath] redirect to ShareIntent screen')
      return {
        routes: [
          {
            name: 'Extract',
          },
        ],
      }
    }
    return getStateFromPath(path, config)
  },

  subscribe(listener) {
    console.debug('react-navigation[subscribe]', PREFIX, PACKAGE_NAME)
    const onReceiveURL = ({ url }) => {
      if (url.includes(getShareExtensionKey())) {
        // REQUIRED FOR iOS WHEN APP IS IN BACKGROUND
        console.debug('react-navigation[onReceiveURL] Redirect to ShareIntent Screen', url)
        console.log(`${getScheme()}://extract`)
        listener(`${getScheme()}://extract`)
      } else {
        console.log(`${getScheme()}://extract`)
        console.debug('react-navigation[onReceiveURL] OPEN URL', url)
        listener(url)
      }
    }

    const shareIntentStateSubscription = ShareIntentModule?.addListener('onStateChange', event => {
      // REQUIRED FOR ANDROID WHEN APP IS IN BACKGROUND
      console.debug('react-navigation[subscribe] shareIntentStateListener', event.value)
      if (event.value === 'pending') {
        console.log(`${getScheme()}://extract`)
        listener(`${getScheme()}://extract`)
      }
    })

    const shareIntentValueSubscription = ShareIntentModule?.addListener('onChange', async event => {
      // REQUIRED FOR IOS WHEN APP IS IN BACKGROUND
      console.debug('react-navigation[subscribe] shareIntentValueListener', event.value)
      const url = await getInitialURL()
      if (url) {
        onReceiveURL({ url })
      }
    })

    const urlEventSubscription = Linking.addEventListener('url', onReceiveURL)

    return () => {
      shareIntentStateSubscription?.remove()
      shareIntentValueSubscription?.remove()
      urlEventSubscription.remove()
    }
  },

  // https://reactnavigation.org/docs/deep-linking/#third-party-integrations
  async getInitialURL() {
    // REQUIRED FOR ANDROID FIRST LAUNCH
    const needRedirect = hasShareIntent(getShareExtensionKey())
    console.debug('react-navigation[getInitialURL] redirect to ShareIntent screen:', needRedirect)

    if (needRedirect) {
      return `${Constants.expoConfig?.scheme}://extract`
    }
    // As a fallback, do the default deep link handling
    const url = await Linking.getInitialURL()
    return url
  },
}
