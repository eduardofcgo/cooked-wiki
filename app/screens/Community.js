import React, { useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'
import { observer } from 'mobx-react-lite'
import { useFocusEffect } from '@react-navigation/native'

import { useStore } from '../context/store/StoreContext'
import { requestPushNotificationsPermission } from '../notifications/push'
import { theme } from '../style/style'
import { Button, PrimaryButton } from '../components/Button'
import CookedWebView from '../components/CookedWebView'
import { getCommunityJournalUrl } from '../urls'

export default Community = observer(({ navigation, route }) => {
  const { userStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus
  const contactsPermissionStatus = userStore.contactsPermissionStatus
  const showFindFriendsCard = userStore.showFindFriendsCard

  useFocusEffect(() => {
    ;(async () => {
      const notificationPermission = await Notifications.getPermissionsAsync()
      userStore.setNotificationPermissionStatus(notificationPermission.status)

      const contactsPermission = await Contacts.getPermissionsAsync()
      userStore.setContactsPermissionStatus(contactsPermission.status)
    })()
  })

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
          onPress={handleAddFriends}>
          <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const handleAddFriends = async () => {
    navigation.navigate('FindFriends')
  }

  const handleEnableNotifications = async () => {
    const permission = await requestPushNotificationsPermission()

    if (permission.status === 'denied' && permission.canAskAgain) {
      userStore.setNotificationPermissionStatus(null)
    } else {
      userStore.setNotificationPermissionStatus(permission.status)
    }
  }

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Notifications.openSettings()
    } else {
      Linking.openSettings()
    }
  }

  const showCardsBar = showFindFriendsCard || notificationPermissionStatus !== 'granted'

  return (
    <View style={styles.container}>
      {showCardsBar && (
        <View style={styles.cardsContainer}>
          {notificationPermissionStatus !== 'granted' && userStore.enabledNotifications && (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Icon name='bell-outline' size={20} color={theme.colors.softBlack} />
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.description}>Get notified when your friends cook something new.</Text>
                </View>
                {notificationPermissionStatus === 'denied' ? (
                  <Button onPress={openSettings} style={styles.cardButton} title='Settings' />
                ) : (
                  <PrimaryButton onPress={handleEnableNotifications} style={styles.cardButton} title='Turn on' />
                )}
              </View>
            </View>
          )}

          {showFindFriendsCard && (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.description}>Connect with your friends to see what they're cooking.</Text>
                </View>
                <PrimaryButton onPress={handleAddFriends} style={styles.cardButton} title='Add friends' />
              </View>
            </View>
          )}
        </View>
      )}

      <CookedWebView startUrl={getCommunityJournalUrl()} navigation={navigation} route={route} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardsContainer: {
    gap: 16,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#706b57',
    marginBottom: 8,
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.black,
    marginBottom: 0,
  },
  cardButton: {
    width: 95,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFriendsButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.default,
    fontWeight: 'bold',
    fontFamily: theme.fonts.ui,
  },
})
