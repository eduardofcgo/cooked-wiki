import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { useEffect } from 'react'

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ShareIntentProvider } from 'expo-share-intent'
import * as Notifications from 'expo-notifications'

import ShoppingList from './app/screens/ShoppingList'
import JustCooked from './app/screens/justcooked/JustCooked'
import Profile from './app/screens/Profile'
import Community from './app/screens/Community'
import Contact from './app/screens/Contact'
import Start from './app/screens/Start'
import Login from './app/screens/Login'
import Register from './app/screens/Register'
import Extract from './app/screens/Extract'
import Recipe from './app/screens/Recipe'
import Timer from './app/components/timer/Timer'
import { tabProps } from './app/navigation/tab'
import linking from './app/navigation/linking'
import registerForPushNotifications from './app/notifications/register'
import FullScreenImage from './app/screens/justcooked/FullScreenImage'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const TabNavigator = createBottomTabNavigator()
const StackNavigator = createNativeStackNavigator()

function Tabs({ route }) {
  console.log('tabs params', route.params)

  const username= route.params.username

  return (
    <TabNavigator.Navigator
      initialRouteName='Profile'
      screenOptions={{
        tabBarActiveTintColor: '#292521',
        tabBarInactiveTintColor: '#292521',
        tabBarActiveBackgroundColor: 'rgba(239, 237, 227, 1)',
        tabBarStyle: {
          height: 60,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#ccc',
          backgroundColor: 'rgba(250, 250, 247, 1)',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 }, // Increased height for a more pronounced shadow
          shadowOpacity: 0.25, // Increased opacity for a more pronounced shadow
          shadowRadius: 8, // Increased radius for a more pronounced shadow
        },
      }}>

      <TabNavigator.Screen
        {...tabProps({
          name: 'Explore',
          title: 'Explore',
          component: Community,
          emogi: '🌍',
        })}
      />

      <TabNavigator.Screen
        initialParams={{username: username}}
        {...tabProps({
          name: 'Profile',
          component: Profile,
          emogi: '📕',
          options: { headerShown: false },
        })}
      />

      <TabNavigator.Screen
        {...tabProps({
          name: 'ShoppingList',
          component: ShoppingList,
          emogi: '🛒',
          title: 'Shopping',
        })}
      />

    </TabNavigator.Navigator>
  )
}

export default function App() {
  useEffect(() => {
    // registerForPushNotifications()
  }, [])

  const [loaded, error] = useFonts({
    'Times-New-Roman': require('./assets/fonts/Times-New-Roman.ttf'),
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <>
      <ShareIntentProvider>
        <StatusBar backgroundColor='#efede3'></StatusBar>

        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer linking={linking}>
            <StackNavigator.Navigator initialRouteName='Start'>
              <StackNavigator.Screen
                name='Main'
                options={{ headerShown: false }}
                component={Tabs}
              />

              <StackNavigator.Screen
                name='Extract'
                component={Extract}
                options={{ title: 'New Recipe', headerStyle: { backgroundColor: '#efede3' } }}
              />

              <StackNavigator.Screen
                name='Recipe'
                component={Recipe}
                options={{ title: 'Recipe', headerStyle: { backgroundColor: '#efede3' } } }
              />

              <StackNavigator.Screen 
                name='Contact' 
                component={Contact}
                options={{ title: 'Contact', headerStyle: { backgroundColor: '#efede3' } }}
                />

              <StackNavigator.Screen
                name='Start'
                component={Start}
                options={{ title: 'Start', headerShown: false}}
              />

            <StackNavigator.Screen
                name='Login'
                component={Login}
                options={{ title: 'Login', headerStyle: { backgroundColor: '#efede3' } }}
              />

            <StackNavigator.Screen
                name='Register'
                component={Register}
                options={{ title: 'Register', headerStyle: { backgroundColor: '#efede3' } }}
              />


              <StackNavigator.Screen
                name="CookedFullScreenImage"
                component={FullScreenImage}
                options={{ headerShown: false }}
              />
            </StackNavigator.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </ShareIntentProvider>
    </>
  )
}
