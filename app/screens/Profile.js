import React, { useContext } from 'react'
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons/faCartShopping'
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { Menu, IconButton } from 'react-native-paper'

import { theme, titleStyle } from '../style/style'

import CookedWebView from '../components/CookedWebView'
import { AuthContext } from '../context/auth'

const Tab = createMaterialTopTabNavigator()

const TabBarLabel = ({ icon, label, focused }) => (
  <View style={tabBarLabelStyle}>
    <FontAwesomeIcon
      icon={icon}
      color={focused ? theme.colors.black : theme.colors.softBlack}
    />

    <Text
      style={{ color: focused ? theme.colors.black : theme.colors.softBlack }}>
      {label}
    </Text>
  </View>
)

const ProfileHeader = ({ username, bio, navigation }) => {
  const [menuVisible, setMenuVisible] = React.useState(false)

  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: 'http://cooked.wiki/image/thumbnail/profile/eduardo/e4038d2e-53b8-4cbb-80ee-c71c1ba2f4b0',
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileText}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.bio}>
            I love baking and other things. This is my bio.
          </Text>
        </View>
      </View>

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
        anchorPosition='bottom'>
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
    </View>
  )
}

function Profile({ route, navigation, username }) {
  return (
    <>
      <ProfileHeader username={username} navigation={navigation} />
      <Tab.Navigator screenOptions={tabStyle}>
        <Tab.Screen
          name='Cooked'
          options={{
            tabBarLabel: ({ focused }) => (
              <TabBarLabel icon={faBook} label='Cooked' focused={focused} />
            ),
          }}>
          {() => (
            <CookedWebView
              startUrl={`http://192.168.1.96:3000/user/${username}/journal`}
              navigation={navigation}
              route={route}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name='Recipes'
          options={{
            tabBarLabel: ({ focused }) => (
              <TabBarLabel icon={faBox} label='Recipes' focused={focused} />
            ),
          }}>
          {() => (
            <CookedWebView
              startUrl={`http://192.168.1.96:3000/user/${username}`}
              navigation={navigation}
              route={route}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name='Shopping'
          options={{
            tabBarLabel: ({ focused }) => (
              <TabBarLabel
                icon={faCartShopping}
                label='Shopping'
                focused={focused}
              />
            ),
          }}>
          {() => (
            <CookedWebView
              startUrl={`http://192.168.1.96:3000/user/${username}/shopping-list`}
              navigation={navigation}
              route={route}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  )
}

export function PublicProfile({ route, navigation }) {
  return (
    <View style={{ ...styles.container, paddingTop: 0 }}>
      <Profile
        route={route}
        navigation={navigation}
        username={route.params.username}
      />
    </View>
  )
}

export function LoggedInProfile({ route, navigation }) {
  const { credentials } = useContext(AuthContext)

  if (!credentials) {
    return null
  }

  return (
    // LoggedInProfile does not have navigation header, so we need to adjust
    // the padding to account for the status bar manually.
    <View style={{ ...styles.container, paddingTop: StatusBar.currentHeight }}>
      <Profile
        route={route}
        navigation={navigation}
        username={credentials.username}
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
  tabBarLabelStyle: { fontSize: theme.fontSizes.default },
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
