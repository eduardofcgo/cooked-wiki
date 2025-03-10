import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSearch, faBook, faCamera, faUser } from '@fortawesome/free-solid-svg-icons'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { theme, screenStyle } from '../style/style'

import Community from '../screens/Community'
import JustCooked from '../screens/justcooked/JustCooked'
import RecordCookScreen from '../screens/RecordCook'
import { LoggedInProfile } from '../screens/Profile'

const TabNavigator = createBottomTabNavigator()

const TabIcon = ({ icon, focused }) => (
  <FontAwesomeIcon icon={icon} color={focused ? theme.colors.primary : theme.colors.softBlack} />
)

function BottomTabs({ route }) {
  const navigation = useNavigation()

  return (
    <TabNavigator.Navigator initialRouteName='Explore' screenOptions={tabScreenStyle}>
      <TabNavigator.Screen
        name='Explore'
        component={Community}
        options={({ route }) => ({
          ...screenStyle,
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon icon={faSearch} focused={focused} />,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                ...tabScreenStyle.tabBarLabelStyle,
                color: focused ? 'black' : theme.colors.softBlack,
              }}
            >
              Explore
            </Text>
          ),
        })}
      />

      <TabNavigator.Screen
        name='RecordCook'
        component={EmptyComponent}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('RecordCook')}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TabIcon icon={faCamera} focused={false} />
              <Text
                style={{
                  ...tabScreenStyle.tabBarLabelStyle,
                  color: theme.colors.softBlack,
                }}
              >
                Add to journal
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <TabNavigator.Screen
        name='LoggedInProfile'
        component={LoggedInProfile}
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={faUser} focused={focused} />,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                ...tabScreenStyle.tabBarLabelStyle,
                color: focused ? 'black' : theme.colors.softBlack,
              }}
            >
              Profile
            </Text>
          ),
        }}
      />
    </TabNavigator.Navigator>
  )
}

// Empty component for the RecordCook tab
const EmptyComponent = () => null;

const tabScreenStyle = {
  tabBarHideOnKeyboard: true,
  tabBarActiveBackgroundColor: theme.colors.secondary,
  tabBarLabelStyle: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
  },
  tabBarStyle: {
    height: 60,
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
    overflow: 'hidden',
    borderWidth: 0,
    borderTopWidth: 0,
    borderColor: theme.colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
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
