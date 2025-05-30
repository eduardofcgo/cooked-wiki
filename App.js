import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'

import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  AtkinsonHyperlegible_700Bold_Italic,
} from '@expo-google-fonts/atkinson-hyperlegible'
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_500Medium_Italic,
  EBGaramond_600SemiBold,
  EBGaramond_600SemiBold_Italic,
  EBGaramond_700Bold,
  EBGaramond_700Bold_Italic,
  EBGaramond_800ExtraBold,
  EBGaramond_800ExtraBold_Italic,
} from '@expo-google-fonts/eb-garamond'
import { ShareIntentProvider } from 'expo-share-intent'
import { observer } from 'mobx-react-lite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'
import { CaptureConsole } from '@sentry/integrations'
import { AuthProvider } from './app/context/AuthContext'
import { NotificationProvider } from './app/context/NotificationContext'
import { PushNotificationProvider } from './app/context/PushNotificationContext'
import NavigationContainer from './app/navigation/NavigationContainer'
import Navigator from './app/screens/stacks/Navigator'
import paperTheme from './app/style/paper'
import { theme } from './app/style/style'

import env from './app/config/environment'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: false,
    integrations: [
      new CaptureConsole({
        levels: ['error'],
      }),
    ],
  })
}

SplashScreen.preventAutoHideAsync()

const splashScreenAnimationOptions = {
  duration: 500,
  fade: true,
}
SplashScreen.setOptions(splashScreenAnimationOptions)

function App() {
  const [loadedFonts] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
    AtkinsonHyperlegible_700Bold_Italic,

    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    EBGaramond_800ExtraBold,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium_Italic,
    EBGaramond_600SemiBold_Italic,
    EBGaramond_700Bold_Italic,
    EBGaramond_800ExtraBold_Italic,
  })

  const [loadedCredentials, setLoadedCredentials] = useState(false)

  const onLoadedCredentials = useCallback(() => {
    setLoadedCredentials(true)
  }, [])

  useEffect(() => {
    if (loadedCredentials && loadedFonts) {
      SplashScreen.hideAsync()
    }
  }, [loadedCredentials, loadedFonts])

  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider onLoadedCredentials={onLoadedCredentials} baseURL={env.API_BASE_URL}>
            <StatusBar backgroundColor={theme.colors.secondary}></StatusBar>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NotificationProvider>
                <PushNotificationProvider>
                  <NavigationContainer>
                    <Navigator />
                  </NavigationContainer>
                </PushNotificationProvider>
              </NotificationProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  )
}

export default Sentry.wrap(observer(App))
