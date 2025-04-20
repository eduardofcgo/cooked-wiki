import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { Text, TouchableOpacity, View, Platform } from 'react-native'
import { screenStyle, theme } from '../../style/style'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import Community from '../../screens/Community'
import { LoggedInProfile } from '../../screens/Profile'

const TabNavigator = createBottomTabNavigator()

const TabIcon = ({ icon, focused }) => (
  <FontAwesomeIcon icon={icon} color={focused ? theme.colors.primary : theme.colors.softBlack} />
)

// Custom Tab Bar to fix iOS styling issues
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabScreenStyle.tabBarStyle}>
      <View style={{ flexDirection: 'row', height: '100%' }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isFocused ? theme.colors.secondary : theme.colors.white,
                height: '100%',
              }}
            >
              {options.tabBarIcon && options.tabBarIcon({ focused: isFocused })}
              <Text
                style={{
                  color: isFocused ? 'black' : theme.colors.softBlack,
                  fontSize: theme.fontSizes.small,
                  fontFamily: theme.fonts.ui,
                }}
              >
                {typeof label === 'function' ? label({ focused: isFocused }) : label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

function MainMenu({ route }) {
  const navigation = useNavigation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Animation values
  const firstButtonY = useSharedValue(0)
  const secondButtonY = useSharedValue(0)
  const buttonsOpacity = useSharedValue(0)
  const rotateZ = useSharedValue(0)
  const plustButtonBorder = useSharedValue(3)
  const overlayOpacity = useSharedValue(0)
  const plusButtonBackgroundColor = useSharedValue(0) // 0 = primary, 1 = secondary

  // Toggle menu function
  const toggleMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)

    if (newState) {
      // Open menu
      firstButtonY.value = withSpring(-92)
      secondButtonY.value = withSpring(-184)
      buttonsOpacity.value = withTiming(1, { duration: 200 })
      rotateZ.value = withTiming(45, { duration: 200 })
      plustButtonBorder.value = withTiming(0, { duration: 200 })
      overlayOpacity.value = withTiming(0.85, { duration: 200 })
      plusButtonBackgroundColor.value = withTiming(1, { duration: 200 }) // Animate to secondary
    } else {
      // Close menu
      firstButtonY.value = withSpring(0)
      secondButtonY.value = withSpring(0)
      buttonsOpacity.value = withTiming(0, { duration: 150 })
      rotateZ.value = withTiming(0, { duration: 200 })
      plustButtonBorder.value = withTiming(3, { duration: 200 })
      overlayOpacity.value = withTiming(0, { duration: 200 })
      plusButtonBackgroundColor.value = withTiming(0, { duration: 200 }) // Animate back to primary
    }
  }

  // Animated styles
  const firstButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: firstButtonY.value }],
      opacity: buttonsOpacity.value,
    }
  })

  const secondButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: secondButtonY.value }],
      opacity: buttonsOpacity.value,
    }
  })

  const plusButtonStyle = useAnimatedStyle(() => {
    // Interpolate between primary and secondary colors
    const backgroundColor = plusButtonBackgroundColor.value === 0 ? theme.colors.primary : theme.colors.secondary

    return {
      borderWidth: plustButtonBorder.value,
      transform: [{ rotateZ: `${rotateZ.value}deg` }],
      backgroundColor,
    }
  })

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      display: overlayOpacity.value > 0 ? 'flex' : 'none',
    }
  })

  return (
    <View style={{ flex: 1 }}>
      <TabNavigator.Navigator
        initialRouteName='Community'
        screenOptions={tabScreenStyle}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <TabNavigator.Screen
          name='Community'
          component={Community}
          options={{
            title: 'Community',
            tabBarIcon: ({ focused }) => <TabIcon icon={faSearch} focused={focused} />,
          }}
        />

        <TabNavigator.Screen
          name='LoggedInProfile'
          component={LoggedInProfile}
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon={faUser} focused={focused} />,
          }}
        />
      </TabNavigator.Navigator>

      {/* Background Overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 999,
          },
          overlayStyle,
        ]}
        pointerEvents={isMenuOpen ? 'auto' : 'none'}
        onTouchStart={() => isMenuOpen && toggleMenu()}
      />

      {/* Floating Action Buttons */}
      <View
        style={{
          position: 'absolute',
          bottom: 48,
          alignSelf: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        {/* First Floating Button */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            },
            firstButtonStyle,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              toggleMenu()
              navigation.navigate('RecordCook')
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 56,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <MaterialCommunityIcons name='camera' color={theme.colors.white} size={20} />

              {/* Label positioned absolutely */}
              <View
                style={{
                  position: 'absolute',
                  left: 72,
                  width: 100,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.white,
                    fontFamily: theme.fonts.ui,
                    fontSize: theme.fontSizes.default,
                    flexShrink: 0,
                  }}
                >
                  Record cook
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Second Floating Button */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            },
            secondButtonStyle,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              toggleMenu()
              navigation.navigate('CreateRecipe')
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 56,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <MaterialCommunityIcons name='book' color={theme.colors.white} size={20} />

              {/* Label positioned absolutely */}
              <View
                style={{
                  position: 'absolute',
                  left: 72,
                  width: 100,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.white,
                    fontFamily: theme.fonts.ui,
                    fontSize: theme.fontSizes.default,
                    flexShrink: 0,
                  }}
                >
                  Create recipe
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Create Button */}
        <TouchableOpacity onPress={toggleMenu}>
          <Animated.View
            style={[
              {
                borderWidth: 3,
                borderColor: theme.colors.white,
                width: 56,
                height: 56,
                borderRadius: 32,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              },
              plusButtonStyle,
            ]}
          >
            <MaterialCommunityIcons
              name='plus'
              color={isMenuOpen ? theme.colors.softBlack : theme.colors.white}
              size={20}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Empty component for the RecordCook tab (no longer needed but kept for reference)
const EmptyComponent = () => null

const tabScreenStyle = {
  tabBarHideOnKeyboard: true,
  tabBarLabelStyle: {
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
    backgroundColor: theme.colors.white,
    position: 'absolute',
    marginHorizontal: 64,
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
