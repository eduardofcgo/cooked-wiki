import CookedWebView from '../components/CookedWebView'
import React from 'react'
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'

const Tab = createMaterialTopTabNavigator();

const TabBarLabel = ({ icon, label, focused }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <FontAwesomeIcon icon={icon} color={focused ? '#292521' : '#706b57'} />
    <Text style={{ color: focused ? '#292521' : '#706b57', marginLeft: 5 }}>{label}</Text>
  </View>
);

const ProfileHeader = ({ username, bio }) => {
  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: 'http://cooked.wiki/image/thumbnail/profile/eduardo/e4038d2e-53b8-4cbb-80ee-c71c1ba2f4b0' }} style={styles.profileImage} />
        <View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.bio}>I love baking and other things. This is my bio</Text>
        </View>
      </View>
    </View>
  );
};

export default function Profile({ route, navigation }) {
  return (
    <View style={styles.container}>
      <ProfileHeader username={route.params.username} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#292521',
          tabBarInactiveTintColor: '#706b57',
          tabBarIndicatorStyle: { backgroundColor: '#d97757' },
          tabBarStyle: {
            backgroundColor: '#efede3',
          },
          tabBarLabelStyle: { fontSize: 16 },
          swipeEnabled: false,
        }}
      >
        <Tab.Screen 
          name="Recipes" 
          options={{
            tabBarLabel: ({ focused }) => (
              <TabBarLabel icon={faBook} label="Recipes" focused={focused} />
            ),        
          }}
        >
          {() => (
            <CookedWebView
              startUrl={`https://cooked.wiki/user/${route.params.username}`}
              navigation={navigation}
              route={route}
            />
          )}
        </Tab.Screen>
        <Tab.Screen 
          name="Cooked" 
          options={{
            tabBarLabel: ({ focused }) => (
              <TabBarLabel icon={faBook} label="Cooked" focused={focused} />
            ),        
          }}
        >
          {() => (
            <CookedWebView
              startUrl={`https://cooked.wiki/user/${route.params.username}/journal`}
              navigation={navigation}
              route={route}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight, 
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#efede3',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: { 
    flex: 1,
    flexWrap: 'wrap', 
    overflow: 'hidden', 
    maxWidth: '95%',
    color: '#706b57',
  },
  patron: {
    fontSize: 16,
    color: '#706b57',
    marginTop: 4,
  },
});
