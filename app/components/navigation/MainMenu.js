import { faCamera, faSearch, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { Text, TouchableOpacity } from 'react-native'

import { screenStyle, theme } from '../../style/style'

import Community from '../../screens/Community'
import { LoggedInProfile } from '../../screens/Profile'

const TabNavigator = createBottomTabNavigator()

const TabIcon = ({ icon, focused }) => (
  <FontAwesomeIcon icon={icon} color={focused ? theme.colors.primary : theme.colors.softBlack} />
)

function MainMenu({ route }) {
  const navigation = useNavigation()

  return (
    <TabNavigator.Navigator initialRouteName='Community' screenOptions={tabScreenStyle}>
      <TabNavigator.Screen
        name='Community'
        component={Community}
        options={({ route }) => ({
          ...screenStyle,
          title: 'Community',
          tabBarIcon: ({ focused }) => <TabIcon icon={faSearch} focused={focused} />,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                ...tabScreenStyle.tabBarLabelStyle,
                color: focused ? 'black' : theme.colors.softBlack,
              }}
            >
              Community
            </Text>
          ),
        })}
      />

      <TabNavigator.Screen
        name='RecordCook'
        component={EmptyComponent}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={faCamera} focused={focused} />,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                ...tabScreenStyle.tabBarLabelStyle,
                color: focused ? 'black' : theme.colors.softBlack,
              }}
            >
              Add to journal
            </Text>
          ),
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('Cooked', { recipeId: '806716fa-8a45-4c6b-96e5-51bbdcf16716' })}
              style={{
                flex: 1,
                gap: 8,
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
const EmptyComponent = () => null

const tabScreenStyle = {
  tabBarHideOnKeyboard: true,
  tabBarActiveBackgroundColor: theme.colors.secondary,
  tabBarLabelStyle: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
  },
  tabBarStyle: {
    height: 64,
    borderRadius: theme.borderRadius.default,
    overflow: 'hidden',
    borderWidth: 0,
    borderTopWidth: 0,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    position: 'absolute',
    marginHorizontal: 16,
    left: 0,
    right: 0,
    bottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
}

export default MainMenu
