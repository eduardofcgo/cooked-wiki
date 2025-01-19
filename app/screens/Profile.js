import React, { useContext, useLayoutEffect, useEffect } from 'react'
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons/faCartShopping'
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { Menu, IconButton } from 'react-native-paper'
import { observer } from 'mobx-react-lite'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useStore } from '../context/store/StoreContext'
import { theme, titleStyle } from '../style/style'

import ProfileCooked from './ProfileCooked'
import CookedWebView from '../components/CookedWebView'
import { AuthContext } from '../context/auth'
import { getProfileImageUrl, getJournalUrl, getProfileUrl, getShoppingListUrl } from '../urls'
import { PrimaryButton, SecondaryButton, Button } from '../components/Button'

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

const ProfileMenu = ({ navigation }) => {
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
          navigation.navigate('Team')
        }}
        title='Patron'
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

  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        {showImage ? (
          <Image
            source={{
              uri: getProfileImageUrl(username),
            }}
            style={styles.profileImage}
          />
        ) : (
          <Icon name='account' size={64} color={theme.colors.softBlack} style={styles.avatarPlaceholder} />
        )}
        <View style={styles.profileText}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.bio}>I love baking and other things. This is my bio.</Text>
        </View>
      </View>

      {menu}
    </View>
  )
}

const Profile = observer(({ route, navigation, username, menu }) => {
  return (
    <>
      <ProfileHeader username={username} navigation={navigation} menu={menu} />
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
          {() => <ProfileCooked username={username} navigation={navigation} route={route} />}
        </Tab.Screen>
        <Tab.Screen
          name='Recipes'
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel icon={faBox} label='Recipes' focused={focused} />,
          }}
        >
          {() => <CookedWebView startUrl={getProfileUrl(username)} navigation={navigation} route={route} />}
        </Tab.Screen>
        <Tab.Screen
          name='Shopping'
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel icon={faCartShopping} label='Shopping' focused={focused} />,
          }}
        >
          {() => <CookedWebView startUrl={getShoppingListUrl(username)} navigation={navigation} route={route} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  )
})

const FollowButton = observer(({ username }) => {
  const { profileStore } = useStore()
  const { isLoadingFollowing } = profileStore
  const isFollowing = profileStore.isFollowing(username)

  if (isLoadingFollowing) {
    return undefined
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isFollowing ? (
        <SecondaryButton title='Following' onPress={() => profileStore.unfollow(username)} />
      ) : (
        <Button title='Follow' onPress={() => profileStore.follow(username)} />
      )}
    </View>
  )
})

export const PublicProfile = observer(({ route, navigation }) => {
  const { profileStore } = useStore()
  const username = route.params.username

  useEffect(() => {
    profileStore.loadFollowing()
  }, [navigation])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <FollowButton username={username} />,
    })
  }, [navigation])

  return (
    <View style={{ ...styles.container, paddingTop: 0 }}>
      <Profile route={route} navigation={navigation} username={username} menu={null} />
    </View>
  )
})

export function LoggedInProfile({ route, navigation }) {
  const { credentials } = useContext(AuthContext)

  if (!credentials) {
    return null
  }

  return (
    <View style={{ ...styles.container, paddingTop: StatusBar.currentHeight, paddingBottom: 40 }}>
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
