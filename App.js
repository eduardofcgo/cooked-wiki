import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Share } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import * as Sharing from 'expo-sharing'

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

import { theme, screenStyle, titleStyle } from './app/style/style'
import paperTheme from './app/style/paper'
import navigationTheme from './app/style/navigation'
import { defaultScreenOptions } from './app/screens/screen'
import { AuthContext } from './app/context/auth'
import BottomTabs from './app/components/BottomTabs'
import ShoppingList from './app/screens/ShoppingList'
import JustCooked from './app/screens/justcooked/JustCooked'
import { PublicProfile, LoggedInProfile } from './app/screens/Profile'
import Community from './app/screens/Community'
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
import registerForPushNotifications from './app/notifications/register'
import FullScreenImage from './app/screens/justcooked/FullScreenImage'
import AuthService from './app/auth/service'
import AuthStore from './app/auth/store'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const StackNavigator = createNativeStackNavigator()

SplashScreen.preventAutoHideAsync()

export default function App() {
  // useEffect(() => {
  //   // registerForPushNotifications()
  // }, [])

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

  const loadedApp = loadedFonts && authContext.credentials !== undefined

  useEffect(() => {
    if (loadedApp) {
      SplashScreen.hideAsync()
    }
  }, [loadedApp])

  useEffect(() => {
    const tryRestoreCredentials = async () => {
      const validCredentials = await AuthService.validateStoredCredentials()

      if (validCredentials) {
        setAuthContext({...authContext, credentials: validCredentials, loggedIn: true})

      } else {
        setAuthContext({...authContext, credentials: null, loggedIn: false})
      }
    }

    tryRestoreCredentials()
  }, [])

  if (!loadedApp) {
    return null
  
  } else
    return (
      <PaperProvider theme={paperTheme}>
        <AuthContext.Provider value={authContext}>
          <ShareIntentProvider>
            <StatusBar backgroundColor={theme.colors.secondary}></StatusBar>

            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer linking={linking} theme={navigationTheme}>
                <StackNavigator.Navigator
                  initialRouteName={authContext.loggedIn ? 'Main' : 'Start'}
                  screenOptions={defaultScreenOptions}>
                  {authContext.loggedIn ? (
                    <>
                      <StackNavigator.Screen
                        name='Main'
                        options={{ headerShown: false }}
                        component={BottomTabs}
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
                                const shareUrl = `https://cooked.wik/recipe`
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
                    </>
                  ) : (
                    <>
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
    )
}
