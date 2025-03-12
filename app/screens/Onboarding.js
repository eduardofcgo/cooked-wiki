import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useStore } from '../context/StoreContext'
import { requestPushNotificationsPermission } from '../notifications/push'

import { PrimaryButton, SecondaryButton } from '../components/core/Button'
import { theme } from '../style/style'

const notificationScreen = {
  icon: 'bell-outline',
  title: 'Never miss a recipe',
  description: 'Get notified when friends cook your recipes.',
  primaryButton: 'Enable notifications',
  secondaryButton: 'Skip',
  action: async () => {
    await requestPushNotificationsPermission()
  },
}

const contactsScreen = {
  icon: 'account-group-outline',
  title: 'Cook together',
  description: 'Find your friends recipes and see what they are cooking.',
  primaryButton: 'Connect contacts',
  secondaryButton: 'Skip',
  action: async () => {
    const { status } = await Contacts.requestPermissionsAsync()
    return status === 'granted'
  },
}

const OnboardingScreen = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [screens, setScreens] = useState([
    {
      icon: 'chef-hat',
      title: 'Welcome to Cooked.wiki',
      description: 'Save, and share your recipes with friends.',
      primaryButton: 'How it works',
    },
    {
      icon: 'help',
      title: 'How it works',
      description: 'Transform any page or video into a step by step recipe.',
      primaryButton: "Let's start!",
    },
  ])

  useEffect(() => {
    ;(async () => {
      const notificationsPermission = await Notifications.getPermissionsAsync()
      const contactsPermission = await Contacts.requestPermissionsAsync()

      if (notificationsPermission.status === 'undetermined') {
        setScreens([...screens, notificationScreen])
      }

      if (contactsPermission.status === 'undetermined') {
        setScreens([...screens, contactsScreen])
      }
    })()
  }, [])

  const nextScreen = () => {
    if (currentScreen === screens.length - 1) {
      navigation.replace('Start')
      return
    }

    setCurrentScreen(currentScreen + 1)
  }

  const handleAction = async () => {
    const screen = screens[currentScreen]
    if (screen.action) {
      await screen.action()
    }
    nextScreen()
  }

  const currentScreenData = screens[currentScreen]

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={currentScreenData.icon} size={80} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>{currentScreenData.title}</Text>
        <Text style={styles.description}>{currentScreenData.description}</Text>

        <View style={styles.buttonsContainer}>
          <PrimaryButton title={currentScreenData.primaryButton} onPress={handleAction} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {screens.map((_, index) => (
            <View key={index} style={[styles.dot, currentScreen === index && styles.activeDot]} />
          ))}
        </View>

        {currentScreenData.secondaryButton ? (
          <View style={styles.footerButton}>
            <SecondaryButton
              title={currentScreenData.secondaryButton}
              onPress={nextScreen}
              style={{ backgroundColor: 'transparent' }}
            />
          </View>
        ) : (
          <View style={{ height: 16 }} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 12,
  },
  footer: {
    paddingBottom: 16,
    backgroundColor: theme.colors.backgroundColor,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  footerButton: {
    paddingHorizontal: 16,
  },
})

export default OnboardingScreen
