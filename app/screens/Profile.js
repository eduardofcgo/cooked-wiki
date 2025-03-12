import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons/faCartShopping'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ActivityIndicator, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { IconButton, Menu } from 'react-native-paper'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'
import { theme, titleStyle } from '../style/style'

import { Button, SecondaryButton } from '../components/core/Button'
import ActionToast from '../components/notification/ActionToast'
import CookedFeed from '../components/profile/CookedFeed'
import EditBio from '../components/profile/EditBio'
import FullScreenImage from '../components/profile/FullScreenImage'
import { useAuth } from '../context/AuthContext'
import { getProfileImageUrl } from '../urls'
import Recipes from './WebViews/Recipes'
import Shopping from './WebViews/Shopping'
const Tab = createMaterialTopTabNavigator()

const tabLabelTextStyle = {
  color: theme.colors.softBlack,
  fontFamily: theme.fonts.ui,
  fontSize: theme.fontSizes.default,
}

const TabBarLabel = ({ icon, label, focused }) => (
  <View style={tabBarLabelStyle}>
    <FontAwesomeIcon icon={icon} color={focused ? theme.colors.black : theme.colors.softBlack} />
    <Text
      style={{
        ...tabLabelTextStyle,
        color: focused ? theme.colors.black : theme.colors.softBlack,
      }}
    >
      {label}
    </Text>
  </View>
)

const ProfileMenu = ({ navigation, onEditBio }) => {
  const [menuVisible, setMenuVisible] = React.useState(false)

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <IconButton
          icon='dots-vertical'
          iconColor={theme.colors.softBlack}
          size={20}
          onPress={() => setMenuVisible(true)}
        />
      }
      anchorPosition='bottom'
    >
      <Menu.Item
        onPress={() => {
          setMenuVisible(false)
          navigation.navigate('Settings')
        }}
        title='Share'
      />
      <Menu.Item
        onPress={() => {
          setMenuVisible(false)
          navigation.navigate('Settings')
        }}
        title='Settings'
      />
      <Menu.Item
        onPress={() => {
          setMenuVisible(false)
          onEditBio()
        }}
        title='Update bio'
      />
      <Menu.Item
        onPress={() => {
          setMenuVisible(false)
          navigation.navigate('Help')
        }}
        title='Help'
      />
    </Menu>
  )
}

const ProfileHeader = ({ username, bio, navigation, menu }) => {
  const showImage = true
  const [isImageFullScreen, setIsImageFullScreen] = React.useState(false)

  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        {showImage ? (
          <>
            <TouchableOpacity onPress={() => setIsImageFullScreen(true)}>
              <Image
                source={{
                  uri: getProfileImageUrl(username),
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <FullScreenImage
              visible={isImageFullScreen}
              imageUrl={getProfileImageUrl(username)}
              onClose={() => setIsImageFullScreen(false)}
              bio={bio}
            />
          </>
        ) : (
          <Icon name='account' size={64} color={theme.colors.softBlack} style={styles.avatarPlaceholder} />
        )}
        <View style={styles.profileText}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.bio}>{bio || 'No bio yet.'}</Text>
        </View>
      </View>

      {menu}
    </View>
  )
}

const Profile = observer(({ route, navigation, username, menu }) => {
  const [editBioVisible, setEditBioVisible] = React.useState(false)
  const { profileStore } = useStore()
  const bio = null

  const handleSaveBio = async newBio => {
    await profileStore.updateBio(newBio)
    setEditBioVisible(false)
  }

  return (
    <>
      <ProfileHeader
        username={username}
        bio={bio}
        navigation={navigation}
        menu={<ProfileMenu navigation={navigation} onEditBio={() => setEditBioVisible(true)} />}
      />
      <EditBio
        visible={editBioVisible}
        onClose={() => setEditBioVisible(false)}
        onSave={handleSaveBio}
        initialBio={bio}
      />
      <Tab.Navigator
        screenOptions={{
          ...tabStyle,
          lazy: true,
        }}
      >
        <Tab.Screen
          name='Cooked'
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel icon={faBook} label='Cooked' focused={focused} />,
          }}
        >
          {() => <CookedFeed username={username} navigation={navigation} route={route} />}
        </Tab.Screen>
        <Tab.Screen
          name='Recipes'
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel icon={faBox} label='Recipes' focused={focused} />,
          }}
        >
          {() => <Recipes username={username} navigation={navigation} route={route} />}
        </Tab.Screen>
        <Tab.Screen
          name='Shopping'
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel icon={faCartShopping} label='Shopping' focused={focused} />,
          }}
        >
          {() => <Shopping username={username} navigation={navigation} route={route} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  )
})

const FollowButton = observer(({ username }) => {
  const { profileStore } = useStore()
  const { showNotification } = useInAppNotification()
  const [isLoading, setIsLoading] = useState(false)

  const isFollowing = profileStore.isFollowing(username)

  const handleFollowPress = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await profileStore.follow(username)
      showNotification(ActionToast, {
        props: { message: 'Followed this user' },
        resetQueue: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [username, isLoading])

  const handleUnfollowPress = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await profileStore.unfollow(username)
      showNotification(ActionToast, {
        props: { message: 'Unfollowed this user' },
        resetQueue: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [username, isLoading])

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isLoading && <ActivityIndicator size='small' color={theme.colors.primary} style={{ marginRight: 5 }} />}
      {isFollowing ? (
        <SecondaryButton title='Following' onPress={handleUnfollowPress} loading={isLoading} style={{ width: 100 }} />
      ) : (
        <Button title='Follow' onPress={handleFollowPress} loading={isLoading} style={{ width: 100 }} />
      )}
    </View>
  )
})

export const PublicProfile = observer(({ route, navigation }) => {
  const { profileStore } = useStore()
  const { credentials } = useAuth()

  const username = route.params.username

  // User can navigate to his own profile from other screens
  const showingOwnProfileAsPublic = credentials.username === username

  useEffect(() => {
    ;(async () => {
      await profileStore.loadFollowing()
    })()
  }, [navigation])

  useLayoutEffect(() => {
    if (!showingOwnProfileAsPublic) {
      navigation.setOptions({
        headerRight: () => <FollowButton username={username} />,
      })
    }
  }, [navigation, showingOwnProfileAsPublic])

  return (
    <View style={{ ...styles.container, paddingTop: 0 }}>
      <Profile route={route} navigation={navigation} username={username} menu={null} />
    </View>
  )
})

export function LoggedInProfile({ route, navigation }) {
  const { credentials } = useAuth()

  if (!credentials) {
    return null
  }

  return (
    <View style={{ ...styles.container, paddingTop: StatusBar.currentHeight }}>
      <Profile
        route={route}
        navigation={navigation}
        username={credentials.username}
        menu={<ProfileMenu navigation={navigation} />}
      />
    </View>
  )
}

const tabBarLabelStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
}

const tabStyle = {
  tabBarActiveTintColor: theme.colors.secondary,
  tabBarInactiveTintColor: theme.colors.secondary,
  tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
  tabBarStyle: {
    backgroundColor: theme.colors.secondary,
  },
  swipeEnabled: false,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  username: {
    ...titleStyle,
  },
  bio: {
    flex: 1,
    flexWrap: 'wrap',
    overflow: 'hidden',
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    paddingRight: 5,
  },
})
