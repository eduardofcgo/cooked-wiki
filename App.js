import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Share } from 'react-native'
import { useEffect, useMemo, useState, useRef } from 'react'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { SchedulableTriggerInputTypes } from 'expo-notifications'

import { Provider as PaperProvider, IconButton } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ShareIntentProvider } from 'expo-share-intent'
import * as Notifications from 'expo-notifications'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons/faCartShopping'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { observer } from 'mobx-react-lite'

import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  AtkinsonHyperlegible_700Bold_Italic,
} from '@expo-google-fonts/atkinson-hyperlegible'
import {
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
} from '@expo-google-fonts/eb-garamond'

import RootStore from './app/store/RootStore'
import { ApiClient } from './app/api/client'
import { theme, screenStyle, titleStyle } from './app/style/style'
import paperTheme from './app/style/paper'
import navigationTheme from './app/style/navigation'
import { defaultScreenOptions } from './app/screens/screen'
import { AuthContext } from './app/context/auth'
import Main from './app/screens/Main'
import { PublicProfile } from './app/screens/Profile'
import Contact from './app/screens/Contact'
import Settings from './app/screens/Settings'
import Team from './app/screens/Team'
import Start from './app/screens/Start'
import Login from './app/screens/Login'
import Register from './app/screens/Register'
import Extract from './app/screens/Extract'
import Recipe from './app/screens/Recipe'
import Cooked from './app/screens/Cooked'
import Timer from './app/components/timer/Timer'
import linking from './app/navigation/linking'
import FullScreenImage from './app/screens/justcooked/FullScreenImage'
import AuthService from './app/auth/service'
import FindFriends from './app/screens/FindFriends'
import { StoreContext } from './app/context/store/StoreContext'
import OnboardingScreen from './app/screens/Onboarding'
import RecipeSearch from './app/screens/RecipeSearch'
import RecordCookRecipe from './app/screens/RecordCookRecipe'

const StackNavigator = createNativeStackNavigator()

SplashScreen.preventAutoHideAsync()

function App() {
  const [loadedFonts, errorFonts] = useFonts({
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

  const [authContext, setAuthContext] = useState({
    credentials: undefined,
    loggedIn: false,

    login: async (username, password) => {
      const newCredentials = await AuthService.login(username, password)

      setAuthContext({ ...authContext, credentials: newCredentials, loggedIn: true })
    },

    logout: async () => {
      await AuthService.logout()

      setAuthContext({ ...authContext, credentials: null, loggedIn: false })
    },
  })

  const apiClient = new ApiClient(authContext.credentials)
  const rootStore = new RootStore(apiClient)

  const loadedApp = loadedFonts && authContext.credentials !== undefined

  if (errorFonts) {
    console.error('Error loading fonts', errorFonts)
  }

  useEffect(() => {
    if (loadedApp) {
      SplashScreen.hideAsync()
    }
  }, [loadedApp])

  useEffect(() => {
    const restoreCredentials = async () => {
      let storedCredentials = null
      try {
        storedCredentials = await AuthService.getStoredCredentials()
      } catch (error) {
        console.error('Error restoring credentials', error)
      }

      setAuthContext({
        ...authContext,
        credentials: storedCredentials,
        loggedIn: Boolean(storedCredentials),
      })
    }

    restoreCredentials()
  }, [])

  if (!loadedApp) {
    return null
  } else
    return (
      <StoreContext.Provider value={rootStore}>
        <PaperProvider theme={paperTheme}>
          <AuthContext.Provider value={authContext}>
            <ShareIntentProvider>
              <StatusBar backgroundColor={theme.colors.secondary}></StatusBar>

              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer linking={linking} theme={navigationTheme}>
                  <StackNavigator.Navigator
                    initialRouteName={authContext.loggedIn ? 'Main' : 'Onboarding'}
                    screenOptions={defaultScreenOptions}
                  >
                    {authContext.loggedIn ? (
                      <>
                        <StackNavigator.Screen name='Main' options={{ headerShown: false }} component={Main} />

                        <StackNavigator.Screen
                          name='Extract'
                          component={Extract}
                          options={{
                            title: 'New Recipe',
                            ...screenStyle,
                            animation: 'slide_from_bottom',
                          }}
                        />

                        <StackNavigator.Screen
                          name='RecordCookRecipe'
                          component={RecordCookRecipe}
                          options={{
                            title: 'Cooked',
                            ...screenStyle,
                            animation: 'slide_from_bottom',
                          }}
                        />

                        <StackNavigator.Screen
                          name='Contact'
                          component={Contact}
                          options={{ title: 'Contact', ...screenStyle }}
                        />

                        <StackNavigator.Screen
                          name='Settings'
                          component={Settings}
                          options={{
                            title: 'Settings',
                            ...screenStyle,
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                          }}
                        />

                        <StackNavigator.Screen
                          name='Team'
                          component={Team}
                          options={{ title: 'Patron', ...screenStyle }}
                        />

                        <StackNavigator.Screen
                          name='Cooked'
                          component={Cooked}
                          options={{ title: 'Cooked', ...screenStyle }}
                        />

                        <StackNavigator.Screen
                          name='Recipe'
                          component={Recipe}
                          options={({ navigation, route }) => ({
                            title: 'Recipe',
                            animation: 'slide_from_right',
                            headerRight: () => (
                              <IconButton
                                icon='send'
                                size={20}
                                style={{ margin: 0, marginRight: -10 }}
                                backgroundColor={theme.colors.secondary}
                                color={theme.colors.black}
                                onPress={() => {
                                  const shareUrl = `http://192.168.1.96:3000/recipe`
                                  Share.share({
                                    message: shareUrl,
                                    url: shareUrl,
                                  })
                                }}
                              />
                            ),
                          })}
                        />

                        <StackNavigator.Screen
                          name='PublicProfile'
                          component={PublicProfile}
                          options={{ title: 'Profile', ...screenStyle }}
                        />

                        <StackNavigator.Screen
                          name='FindFriends'
                          component={FindFriends}
                          options={{
                            title: 'Find friends',
                            headerBackTitle: 'Back',
                            animation: 'slide_from_right',
                          }}
                        />

                        <StackNavigator.Screen
                          name='RecipeSearch'
                          component={RecipeSearch}
                          options={{
                            title: 'Select recipe',
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <StackNavigator.Screen
                          name='Onboarding'
                          options={{ headerShown: false }}
                          component={OnboardingScreen}
                        />

                        <StackNavigator.Screen
                          name='Start'
                          component={Start}
                          options={{ title: 'Start', headerShown: false }}
                        />

                        <StackNavigator.Screen
                          name='Login'
                          component={Login}
                          options={{ title: 'Login', ...screenStyle }}
                        />

                        <StackNavigator.Screen
                          name='Register'
                          component={Register}
                          options={{ title: 'Register', ...screenStyle }}
                        />
                      </>
                    )}
                  </StackNavigator.Navigator>
                </NavigationContainer>
              </GestureHandlerRootView>
            </ShareIntentProvider>
          </AuthContext.Provider>
        </PaperProvider>
      </StoreContext.Provider>
    )
}

export default observer(App)
