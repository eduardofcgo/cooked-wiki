import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native'
import { IconButton } from 'react-native-paper'
import { StatusBar } from 'react-native'

import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'

export default function Login({ navigation, route }) {
  const auth = useAuth()

  const [username, setUsername] = useState(auth?.credentials?.username || '')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => { 
    StatusBar.setBackgroundColor(theme.colors.secondary, true)
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      await auth.login(username, password)
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })    
    
    } catch (error) {
      setIsLoading(false)

      alert(error.message)

      console.error(error)
    }

    setIsLoading(false)
  }

  const handleAppleLogin = async () => {
    try {
      // Implement your native Apple sign-in logic here
      console.log('Apple sign-in pressed')
    } catch (error) {
      console.error('Apple authentication error:', error)
      alert('Apple sign in failed. Please try again.')
    }
  }

  const handleResetPassword = async () => {
    try {
      await Linking.openURL('https://cooked.wiki/user/reset/send');
    } catch (error) {
      console.error('Error opening reset password link:', error);
      alert('Could not open the reset password page. Please try again later.');
    }
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome back!</Text>
          <Text style={styles.subHeaderText}>
            Only for old accounts previously registered on the site with username and password.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* <TouchableOpacity onPress={handleAppleLogin} style={styles.appleButton}>
            <View style={styles.appleButtonContent}>
              <IconButton icon='apple' iconColor='white' size={20} style={styles.appleIcon} />
              <Text style={styles.appleButtonText}>Sign in with Apple</Text>
            </View>
          </TouchableOpacity> */}

          {/* <Text style={styles.helpText}>or</Text> */}

          <TextInput
            style={styles.input}
            placeholder='Username'
            value={username}
            onChangeText={setUsername}
            autoCapitalize='none'
          />
          <TextInput
            style={styles.input}
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            autoCapitalize='none'
            secureTextEntry
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleLogin} style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Forgot your password?
            <Text style={{ color: '#d97757' }} onPress={handleResetPassword}> Reset</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafaf7',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
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
  button: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#efede3',
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased height for a more pronounced shadow
    shadowOpacity: 0.25, // Increased opacity for a more pronounced shadow
    shadowRadius: 8, // Increased radius for a more pronounced shadow
  },
  registerButton: {
    backgroundColor: theme.colors.softBlack,
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
  registerButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonText: {
    color: '#706b57',
    fontSize: 16,
  },
  appleButton: {
    backgroundColor: 'black',
    borderRadius: theme.borderRadius.small,
    paddingVertical: 5,
    alignItems: 'center',
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    margin: 0,
  },
  appleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerText: {
    fontFamily: theme.fonts.title,
    fontSize: 40,
    color: theme.colors.black,
    marginBottom: 8,
  },
  subHeaderText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    opacity: 0.8,
  },
})
