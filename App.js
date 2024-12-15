import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Share } from 'react-native'
import { useEffect, useMemo, useState, useRef } from 'react'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

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
import Timer from './app/components/timer/Timer'
import linking from './app/navigation/linking'
import FullScreenImage from './app/screens/justcooked/FullScreenImage'
import AuthService from './app/auth/service'
import FindFriends from './app/screens/FindFriends'
import { ApiContext } from './app/context/api'
import { StoreContext } from './app/context/store/StoreContext'
import OnboardingScreen from './app/screens/Onboarding'

const StackNavigator = createNativeStackNavigator()

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [loadedFonts, errorFonts] = useFonts({
    [theme.fonts
      .title]: require('./assets/fonts/EBGaramond-VariableFont_wght.ttf'),
  })

  const [authContext, setAuthContext] = useState({
    credentials: undefined,
    loggedIn: false,

    login: async (username, password) => {
      const newCredentials = await AuthService.login(username, password)

      setAuthContext({...authContext, credentials: newCredentials, loggedIn: true})
    },

    logout: async () => {
      await AuthService.logout()

      setAuthContext({...authContext, credentials: null, loggedIn: false})
    },
  })

  const apiClient = new ApiClient(authContext.credentials)
  const rootStore = new RootStore(apiClient)

  const loadedApp = (loadedFonts || errorFonts) && authContext.credentials !== undefined

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
        loggedIn: Boolean(storedCredentials)
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
            <ApiContext.Provider value={apiClient}>
              <ShareIntentProvider>
                <StatusBar backgroundColor={theme.colors.secondary}></StatusBar>

                <GestureHandlerRootView style={{ flex: 1 }}>
                  <NavigationContainer linking={linking} theme={navigationTheme}>
                    <StackNavigator.Navigator
                      initialRouteName={authContext.loggedIn ? 'Main' : 'Onboarding'}
                      screenOptions={defaultScreenOptions}>
                      {authContext.loggedIn ? (
                        <>
                          <StackNavigator.Screen
                            name='Main'
                            options={{ headerShown: false }}
                            component={Main}
                          />

                          <StackNavigator.Screen
                            name='Extract'
                            component={Extract}
                            options={{ title: 'New Recipe', ...screenStyle }}
                          />

                          <StackNavigator.Screen
                            name='Contact'
                            component={Contact}
                            options={{ title: 'Contact', ...screenStyle }}
                          />

                          <StackNavigator.Screen
                            name='Settings'
                            component={Settings}
                            options={{ title: 'Settings', ...screenStyle }}
                          />

                          <StackNavigator.Screen
                            name='Team'
                            component={Team}
                            options={{ title: 'Patron', ...screenStyle }}
                          />

                          <StackNavigator.Screen
                            name='Recipe'
                            component={Recipe}
                            options={({ navigation, route }) => ({
                              title: 'Recipe',
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
                            name="FindFriends"
                            component={FindFriends}
                            options={{
                              title: 'Find friends',
                              headerBackTitle: 'Back',
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
            </ApiContext.Provider>
          </AuthContext.Provider>
        </PaperProvider>
      </StoreContext.Provider>
    )
}

