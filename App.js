import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { useEffect } from 'react'

import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ShareIntentProvider } from 'expo-share-intent'
import * as Notifications from 'expo-notifications'

import ShoppingList from './app/screens/ShoppingList'
import RecordCook from './app/screens/RecordCook'
import Profile from './app/screens/Profile'
import Community from './app/screens/Community'
import Contact from './app/screens/Contact'
import Login from './app/screens/Login'
import Extract from './app/screens/Extract'
import Timer from './app/components/timer/Timer'
import { tabProps } from './app/navigation/tab'
import linking from './app/navigation/linking'
import registerForPushNotifications from './app/notifications/register'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const TabNavigator = createBottomTabNavigator()
const StackNavigator = createNativeStackNavigator()

function Tabs() {
  return (
    <TabNavigator.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#292521',
        tabBarInactiveTintColor: '#292521',
        tabBarActiveBackgroundColor: '#efede3',
        tabBarInactiveBackgroundColor: '#fafaf7',
      }}>
      <TabNavigator.Screen
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
          title: 'Shopping List',
        })}
      />
      <TabNavigator.Screen
        {...tabProps({
          name: 'RecordCook',
          component: RecordCook,
          emogi: '📝',
          title: 'Just Cooked',
          options: {
            headerShown: false,
          },
        })}
      />
      <TabNavigator.Screen
        {...tabProps({
          name: 'Community',
          title: 'Community',
          component: Community,
          emogi: '🌍',
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

        <NavigationContainer linking={linking}>
          <StackNavigator.Navigator initialRouteName='Main'>
            <StackNavigator.Screen
              name='Main'
              options={{ headerShown: false }}
              component={Tabs}
            />

            <StackNavigator.Screen
              name='Extract'
              component={Extract}
              options={{ title: 'New Recipe' }}
            />

            <StackNavigator.Screen name='Contact' component={Contact} />

            <StackNavigator.Screen
              name='Login'
              component={Login}
              options={{ headerShown: false }}
            />
          </StackNavigator.Navigator>
        </NavigationContainer>
      </ShareIntentProvider>

      {/*<Timer/>*/}
    </>
  )
}
