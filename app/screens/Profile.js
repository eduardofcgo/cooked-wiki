import {
  createDrawerNavigator,
  DrawerToggleButton,
} from '@react-navigation/drawer'

import CookedWebView from '../components/CookedWebView'
import React, { useEffect } from 'react'
import { View, Text } from 'react-native'

const Drawer = createDrawerNavigator()

function ProfileWebView({ route, navigation }) {
  return (
    <CookedWebView
      startUrl={`https://cooked.wiki/user/${route.params.username}`}
      navigation={navigation}
      route={route}
    />
  )
}

function ProfileNotifications({ route, navigation }) {
  return (
    <View>
      <Text>Wow</Text>
    </View>
  )
}

function Patron() {
  return (
    <View>
      <Text>Become a patron</Text>
    </View>
  )
}

export default function Profile({ route, navigation }) {
  console.log('profile params', route.params)

  return (
    <Drawer.Navigator
      initialRouteName='ProfileView'
      screenOptions={{
        drawerPosition: 'right',
        headerLeft: false,
        headerRight: () => <DrawerToggleButton />,
        drawerActiveBackgroundColor: '#efede3',
        drawerActiveTintColor: '#292521',
        drawerInactiveTintColor: '#706b57',
        drawerStyle: {
          backgroundColor: '#fafaf7',
        },
      }}>
      <Drawer.Screen
        name='ProfileView'
        component={ProfileWebView}
        initialParams={{username: route.params.username}}
        options={{
          title: 'Profile',
          headerTitle: '📕 Profile',
          headerStyle: {
            backgroundColor: '#efede3',
          },
          headerTitleStyle: {
            color: '#292521',
            fontFamily: 'Times-New-Roman',
          },
        }}
      />
      <Drawer.Screen
        name='Patron'
        component={ProfileNotifications}
        options={{
          title: 'Become a Patron',
          headerTitle: 'Become a Patron',
          headerStyle: {
            backgroundColor: '#fafaf7',
          },
          headerTitleStyle: {
            color: '#292521',
          },
        }}
      />
      <Drawer.Screen
        name='ProfileSettings'
        component={ProfileNotifications}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: '#fafaf7',
          },
          headerTitleStyle: {
            color: '#292521',
          },
        }}
      />
    </Drawer.Navigator>
  )
}
