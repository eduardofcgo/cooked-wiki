import { useFocusEffect } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'

import * as Contacts from 'expo-contacts'
import { Button, PrimaryButton, SecondaryButton } from '../components/core/Button'
import Loading from '../components/core/Loading'
import ActionToast from '../components/notification/ActionToast'
import { theme } from '../style/style'

const Image = FastImage
const FlatList = FlashList

function openSettings() {
  if (Platform.OS === 'ios') {
    Notifications.openSettings()
  } else {
    Linking.openSettings()
  }
}

const UserItem = observer(({ user, navigation }) => {
  const { findFriendsStore } = useStore()
  const { showInAppNotification } = useInAppNotification()

  const handleFollow = useCallback(() => {
    findFriendsStore.follow(user.username)

    showInAppNotification(ActionToast, {
      props: { message: 'Followed ' + user.username },
      resetQueue: true,
    })
  }, [findFriendsStore, user.username])

  const handleUnfollow = useCallback(() => {
    findFriendsStore.unfollow(user.username)

    showInAppNotification(ActionToast, {
      props: { message: 'Unfollowed ' + user.username },
      resetQueue: true,
    })
  }, [findFriendsStore, user.username])

  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('PublicProfile', { username: user.username })}
    >
      <View style={styles.userInfo}>
        <Image source={{ uri: user['profile-image-url'] }} style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userName} color={theme.colors.black}>
            {user.username}
          </Text>
        </View>
      </View>

      {user['is-following'] ? (
        <SecondaryButton title='Following' style={styles.toggleFollowButton} onPress={handleUnfollow} />
      ) : (
        <Button title='Follow' style={styles.toggleFollowButton} onPress={handleFollow} />
      )}
    </TouchableOpacity>
  )
})

function FindFriends({ navigation }) {
  const { findFriendsStore, userStore } = useStore()
  const { isEmptySearch, searchQuery, users, loading } = findFriendsStore
  const { contactsPermissionStatus, loadingFriendsProfiles, suggestedFriendsProfiles } = userStore

  useFocusEffect(() => {
    ;(async () => {
      const contactsPermission = await Contacts.getPermissionsAsync()

      if (contactsPermission.canAskAgain && contactsPermission.status === 'denied') {
        userStore.setContactsPermissionStatus(null)
      } else {
        userStore.setContactsPermissionStatus(contactsPermission.status)
      }
    })()
  })

  useEffect(() => {
    if (contactsPermissionStatus === 'granted') {
      ;(async () => {
        await userStore.trySyncContacts()
      })()
    }
  }, [contactsPermissionStatus])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      findFriendsStore.resetSearch()
    })

    return unsubscribe
  }, [navigation])

  const requestContactsPermission = async () => {
    const contactsPermission = await Contacts.requestPermissionsAsync()
    userStore.setContactsPermissionStatus(contactsPermission.status)
  }

  const ContactsPermissionCard = () => (
    <View style={styles.permissionCard}>
      <Icon name='account-group' size={48} color={theme.colors.primary} />
      <Text style={styles.permissionTitle}>Find friends from contacts</Text>
      {contactsPermissionStatus === 'denied' ? (
        <Text style={styles.permissionDescription}>
          You have not granted permission to access contacts. Please allow access in settings.
        </Text>
      ) : (
        <Text style={styles.permissionDescription}>
          We respect your privacy, only encrypted contacts are sent to our servers.
        </Text>
      )}

      {contactsPermissionStatus === 'denied' ? (
        <Button title='Settings' onPress={openSettings} />
      ) : (
        <PrimaryButton title='Allow access' onPress={requestContactsPermission} />
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name='magnify' size={20} color={theme.colors.softBlack} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search by username'
          value={searchQuery}
          onChangeText={query => findFriendsStore.setSearchQuery(query)}
          selectionColor={theme.colors.primary}
          autoCapitalize='none'
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => findFriendsStore.resetSearch()}>
            <Icon name='close' size={20} color={theme.colors.softBlack} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.resultsContainer}>
          <Loading />
        </View>
      ) : isEmptySearch ? (
        contactsPermissionStatus !== 'granted' ? (
          <ContactsPermissionCard />
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.permissionTitle}>Suggested friends</Text>
            {suggestedFriendsProfiles?.length > 0 ? (
              <FlatList
                data={suggestedFriendsProfiles?.slice()}
                estimatedItemSize={100}
                renderItem={({ item }) => <UserItem user={item} navigation={navigation} />}
                keyExtractor={item => item.username}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <Text style={styles.emptySearchText}>
                {loadingFriendsProfiles ? 'Loading...' : 'No friends found, try searching by username.'}
              </Text>
            )}
            {loadingFriendsProfiles && (
              <View style={{ marginTop: 16 }}>
                <Loading />
              </View>
            )}
          </View>
        )
      ) : (
        <View style={styles.resultsContainer}>
          {users.length > 0 ? (
            <FlatList
              data={users?.slice()}
              estimatedItemSize={100}
              renderItem={({ item }) => <UserItem user={item} navigation={navigation} />}
              keyExtractor={item => item.username}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.emptySearchText}>No users found.</Text>
          )}
        </View>
      )}
    </View>
  )
}

export default observer(FindFriends)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.secondary,
    margin: 16,
    marginBottom: 0,
    borderRadius: theme.borderRadius.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
  },
  listContainer: {
    marginBottom: 16,
    padding: 16,
    paddingTop: 0,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  userHandle: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.gray,
  },
  toggleFollowButton: {
    width: 105,
  },
  followingButton: {
    backgroundColor: theme.colors.secondary,
  },
  followButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    fontWeight: '600',
  },
  followingButtonText: {
    color: theme.colors.softBlack,
  },
  loader: {
    marginTop: 20,
  },
  permissionCard: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionTitle: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsContainer: {
    marginTop: 16,
    flex: 1,
  },
  emptySearchText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginBottom: 24,
  },
})
