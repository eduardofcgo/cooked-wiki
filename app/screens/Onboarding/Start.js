import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Logo from '../../components/core/Logo'
import { theme } from '../../style/style'

export default function Start({ navigation, route }) {
  const handleGoogleLogin = () => {
    // TODO: Implement Google authentication
    navigation.navigate('HowItWorks')
  }

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook authentication
    navigation.navigate('HowItWorks')
  }

  const handleAppleLogin = () => {
    // TODO: Implement Apple authentication
    navigation.navigate('HowItWorks')
  }

  const handlePasswordLogin = () => {
    navigation.navigate('Login')
  }

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.secondary, true)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Welcome!</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton}>
          {/* TODO: Add Google icon here */}
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFacebookLogin} style={styles.facebookButton}>
          {/* TODO: Add Facebook icon here */}
          <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAppleLogin} style={styles.appleButton}>
          {/* TODO: Add Apple icon here */}
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePasswordLogin} style={styles.passwordButton}>
          <Text style={styles.passwordButtonText}>Continue with Password</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Need help?
          <Text style={{ color: theme.colors.primary }}> Contact</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fafaf7',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 10,
  },
  title: {
    marginTop: 64,
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.softBlack,
    textAlign: 'center',
    textAlign: 'center',
  },
  input: {
    fontSize: 16,
    height: 40,
    borderColor: '#706b57',
    backgroundColor: 'white',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  helpText: {
    marginTop: 30,
    marginBottom: 30,
    color: '#706b57',
    textAlign: 'center',
    fontSize: 16,
  },
  // Common button styles
  buttonBase: {
    borderRadius: 5,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  // Google button
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#5f6368',
    fontSize: 16,
    fontWeight: '500',
  },
  // Facebook button
  facebookButton: {
    backgroundColor: '#1877f2',
    borderColor: '#1877f2',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  facebookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // Apple button
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // Password button
  passwordButton: {
    backgroundColor: theme.colors.softBlack,
    borderColor: '#ccc',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  passwordButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
})
