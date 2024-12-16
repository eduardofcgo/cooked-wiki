import React, { useContext, useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Linking, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { List, Button, Switch } from 'react-native-paper'
import { theme } from '../style/style'
import { AuthContext } from '../context/auth'
import LoadingScreen from '../screens/Loading'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/store/StoreContext'
import * as Notifications from 'expo-notifications'

export default Settings = observer(({ navigation }) => {
  const { userStore } = useStore()
  const { logout } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)

  const enabledNotifications = userStore.enabledNotifications
  const notificationPermissionStatus = userStore.notificationPermissionStatus

  useFocusEffect(() => {
    ;(async () => {
      const permission = await Notifications.getPermissionsAsync()
      userStore.setNotificationPermissionStatus(permission.status)
    })()
  })

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      setIsLoading(false)

      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    }
    setIsLoading(false)
  }

  const handleNotificationToggle = async value => {
    if (notificationPermissionStatus === 'denied') {
      if (Platform.OS === 'ios') {
        Notifications.openSettings()
      } else {
        Linking.openSettings()
      }
      return
    }

    if (notificationPermissionStatus === 'granted') {
      userStore.setEnabledNotifications(value)
    }
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title='Profile'
            left={props => <List.Icon {...props} icon='account' />}
            onPress={() => navigation.navigate('PublicProfile')}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Device Settings</List.Subheader>
          <List.Item
            title='Enable Notifications'
            description={
              notificationPermissionStatus === 'denied' ? 'Notifications are blocked in system settings' : null
            }
            left={props => <List.Icon {...props} icon='bell' />}
            right={() => <Switch value={enabledNotifications} onValueChange={handleNotificationToggle} />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>App</List.Subheader>
          <List.Item
            title='About'
            left={props => <List.Icon {...props} icon='information' />}
            onPress={() => {
              /* Handle about */
            }}
          />
          <List.Item
            title='Help'
            left={props => <List.Icon {...props} icon='help-circle' />}
            onPress={() => navigation.navigate('Help')}
          />
        </List.Section>
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#706b57',
    backgroundColor: '#706b57',
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    opacity: 0.5,
  },
})
