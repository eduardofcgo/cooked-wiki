import React, { useEffect, useCallback, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native'
import Logo from '../../components/core/Logo'
import { theme } from '../../style/style'
import { getGoogleRegisteredUsername } from '../../urls'
import { useAuth } from '../../context/AuthContext'
import { getContactUrl } from '../../urls'
import LottieView from 'lottie-react-native'
import { LinearGradient } from 'expo-linear-gradient'

import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'

export default function Start({ navigation, route }) {
  const auth = useAuth()
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const navigateToMain = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    })
  }, [navigation])

  useEffect(() => {
    GoogleSignin.configure({
      // webClientId: '738495561582-en2jurt5k698phvs1jrja9kqlb7i04nb.apps.googleusercontent.com',

      webClientId: '738495561582-dciekt14ot4e5sls81udrdb5i0afd6fq.apps.googleusercontent.com',

      iosClientId: '738495561582-dciekt14ot4e5sls81udrdb5i0afd6fq.apps.googleusercontent.com',
      offlineAccess: true,
    })
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()

      console.log('google sign in response', response)

      if (isSuccessResponse(response)) {
        const { idToken } = response.data

        const registeredUsernameResponse = await fetch(getGoogleRegisteredUsername(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'id-token': idToken }),
        })

        const registeredUsernameResponseData = await registeredUsernameResponse.json()
        const associatedUsername = registeredUsernameResponseData.username
        const defaultImagePath = registeredUsernameResponseData['default-profile-image-path']

        console.log('associatedUsername', registeredUsernameResponseData)

        if (associatedUsername) {
          await auth.googleLogin(associatedUsername, idToken)
        } else {
          navigation.navigate('SetupUsername', {
            idToken: idToken,
            defaultImagePath: defaultImagePath,
          })
        }
      } else {
        console.log('sign in was cancelled by user')
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log('sign in already in progress')
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.log('play services not available or outdated')
            break
          default:
            console.log('some other error happened', error)
        }
      } else {
        throw error
      }
    }
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
    if (!agreedToTerms) {
      Alert.alert('Terms and Conditions', 'Please agree to the Terms and Conditions to continue.', [{ text: 'OK' }])
      return
    }
    navigation.navigate('Login')
  }

  const handleContactPress = async () => {
    try {
      const url = getContactUrl()
      const supported = await Linking.canOpenURL(url)

      if (supported) {
        await Linking.openURL(url)
      } else {
        console.error('Cannot open URL: ' + url)
      }
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  const handlePrivacyPolicyPress = async () => {
    try {
      const url = 'https://cooked.wiki/terms/pp.txt'
      const supported = await Linking.canOpenURL(url)

      if (supported) {
        await Linking.openURL(url)
      } else {
        console.error('Cannot open URL: ' + url)
      }
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  const handleTermsPress = async () => {
    try {
      const url = 'https://cooked.wiki/terms/tos.txt'
      const supported = await Linking.canOpenURL(url)

      if (supported) {
        await Linking.openURL(url)
      } else {
        console.error('Cannot open URL: ' + url)
      }
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  const handleEulaPress = async () => {
    try {
      const url = 'https://cooked.wiki/terms/eula.txt'
      const supported = await Linking.canOpenURL(url)

      if (supported) {
        await Linking.openURL(url)
      } else {
        console.error('Cannot open URL: ' + url)
      }
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.background]}
        style={[styles.gradient]}
        locations={[0, 0.25]}
      />
      <View style={styles.topSection}>
        <Logo style={styles.logo} />
        <LottieView
          source={require('../../../assets/animations/cooked_background.json')}
          style={styles.backgroundAnimation}
          autoPlay
          loop
          speed={2}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Text style={styles.title}>Welcome to Cooked.wiki</Text>

        {/* <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFacebookLogin} style={styles.facebookButton}>
          <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAppleLogin} style={styles.appleButton}>
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={handlePasswordLogin} style={styles.passwordButton}>
          <Text style={styles.passwordButtonText}>Continue with Password</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.checkboxContainer}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text onPress={handleTermsPress} style={styles.termsLink}>
                Terms and Conditions
              </Text>{' '}
              and{' '}
              <Text onPress={handleEulaPress} style={styles.termsLink}>
                EULA
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinksContainer}>
          <TouchableOpacity onPress={handlePrivacyPolicyPress}>
            <Text style={styles.helpText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleContactPress}>
            <Text style={styles.helpText}>Help & delete account</Text>
          </TouchableOpacity>
        </View>
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
    maxWidth: 500,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 10,
    alignSelf: 'center',
  },
  title: {
    marginTop: 64,
    marginBottom: 16,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
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
    marginTop: 5,
    marginBottom: 16,
    color: theme.colors.softBlack,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.default,
    textAlign: 'center',
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
  backgroundAnimation: {
    opacity: theme.opacity.disabled,
    position: 'absolute',
    width: '150%',
    height: '150%',
    zIndex: -1,
    left: '-25%',
    top: '-20%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 0,
  },
  // Terms and conditions styles
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.softBlack,
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    flexShrink: 1,
  },
  termsLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    gap: 20,
  },
})
