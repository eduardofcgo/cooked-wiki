import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback } from 'react'

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
import { NavigationContainer } from '@react-navigation/native'
import { ShareIntentProvider } from 'expo-share-intent'
import { observer } from 'mobx-react-lite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './app/context/AuthContext'

import { NotificationProvider } from './app/context/NotificationContext'
import linking from './app/navigation/linking'
import Navigator from './app/screens/stacks/Navigator'
import navigationTheme from './app/style/navigation'
import paperTheme from './app/style/paper'
import { theme } from './app/style/style'

SplashScreen.preventAutoHideAsync()

function App() {
  useFonts({
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

  const onLoadedCredentials = useCallback(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider onLoadedCredentials={onLoadedCredentials}>
          <ShareIntentProvider>
            <StatusBar backgroundColor={theme.colors.secondary}></StatusBar>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer linking={linking} theme={navigationTheme}>
                <NotificationProvider>
                  <Navigator />
                </NotificationProvider>
              </NavigationContainer>
            </GestureHandlerRootView>
          </ShareIntentProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

export default observer(App)
