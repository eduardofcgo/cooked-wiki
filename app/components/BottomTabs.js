import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
  faSearch,
  faBook,
  faCamera,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import { theme, screenStyle } from '../style/style'
import Community from '../screens/Community'
import { LoggedInProfile } from '../screens/Profile'

const TabNavigator = createBottomTabNavigator()

const TabIcon = ({ icon, focused }) => (
  <FontAwesomeIcon
    icon={icon}
    color={focused ? theme.colors.primary : theme.colors.softBlack}
  />
)

function BottomTabs({ route }) {
  return (
    <TabNavigator.Navigator
      initialRouteName='LoggedInProfile'
      screenOptions={tabScreenStyle}>
      <TabNavigator.Screen
        name='Explore'
        component={Community}
        options={({ route }) => ({
          ...screenStyle,
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={faSearch} focused={focused} />
          ),
        })}
      />

      <TabNavigator.Screen
        name='LoggedInProfile'
        component={LoggedInProfile}
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={faUser} focused={focused} />
          ),
        }}
      />

      <TabNavigator.Screen
        name='ShareCook'
        component={LoggedInProfile}
        options={{
          title: 'Share a Cooked',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={faCamera} focused={focused} />
          ),
        }}
      />
    </TabNavigator.Navigator>
  )
}

const tabScreenStyle = {
  tabBarHideOnKeyboard: true,
  tabBarActiveTintColor: theme.colors.black,
  tabBarInactiveTintColor: theme.colors.softBlack,
  tabBarActiveBackgroundColor: theme.colors.secondary,
  tabBarStyle: {
    height: 60,
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: theme.colors.background,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
}

export default BottomTabs
