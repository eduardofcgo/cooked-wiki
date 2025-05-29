import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Linking, Platform, Alert } from 'react-native'
import { List, Switch } from 'react-native-paper'
import { theme } from '../style/style'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../screens/Loading'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/StoreContext'
import { usePushNotification } from '../context/PushNotificationContext'

export default Settings = observer(({ navigation }) => {
  const { hasPermission, requestPermission } = usePushNotification()
  const { userStore } = useStore()
  const { logout } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  const enabledNotifications = userStore.settings.getEnabledNotifications()

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          setIsLoading(true)
          try {
            await userStore.clearStores()
            await logout()
          } catch (error) {
            setIsLoading(false)
            console.error('Logout error:', error)
            alert('Failed to logout. Please try again.')
          }
          setIsLoading(false)
          navigation.reset({
            index: 0,
            routes: [{ name: 'Start' }],
          })
        },
        style: 'destructive',
      },
    ])
  }

  const handleNotificationToggle = value => {
    userStore.settings.setEnabledNotifications(value)

    if (!hasPermission) {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:')
      } else {
        Linking.openSettings()
      }
      return
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
          <List.Subheader
            style={{ color: theme.colors.softBlack, fontSize: theme.fontSizes.small, fontFamily: theme.fonts.ui }}
          >
            Device Settings
          </List.Subheader>
          <List.Item
            title='Enable Notifications'
            description={!hasPermission ? 'Notifications are blocked in system settings' : null}
            descriptionStyle={{
              color: theme.colors.softBlack,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.ui,
            }}
            titleStyle={{ color: theme.colors.black, fontSize: theme.fontSizes.default, fontFamily: theme.fonts.ui }}
            left={props => <List.Icon {...props} color={theme.colors.softBlack} icon='bell' />}
            right={() => (
              <Switch value={enabledNotifications && hasPermission} onValueChange={handleNotificationToggle} />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={{ color: theme.colors.softBlack, fontSize: theme.fontSizes.small, fontFamily: theme.fonts.ui }}
          >
            App
          </List.Subheader>
          <List.Item
            title='About'
            titleStyle={{ color: theme.colors.black, fontSize: theme.fontSizes.default, fontFamily: theme.fonts.ui }}
            left={props => <List.Icon {...props} color={theme.colors.softBlack} icon='information' />}
            onPress={() => Linking.openURL('https://cooked.wiki/team')}
          />
          <List.Item
            title='Contact'
            titleStyle={{ color: theme.colors.black, fontSize: theme.fontSizes.default, fontFamily: theme.fonts.ui }}
            left={props => <List.Icon {...props} color={theme.colors.softBlack} icon='help-circle' />}
            onPress={() => Linking.openURL('https://cooked.wiki/contact')}
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
    padding: 32,
    borderTopWidth: 1,
    backgroundColor: theme.colors.white,
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
