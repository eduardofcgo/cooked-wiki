import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Logo from '../../components/core/Logo'
import { theme } from '../../style/style'

export default function Start({ navigation, route }) {
  const handleLogin = () => {
    navigation.navigate('HowItWorks')
  }

  const handleRegister = () => {
    navigation.navigate('Register')
  }

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.background, true)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Logo style={styles.logo} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          How does it work?
          <Text style={{ color: '#d97757' }}> Help</Text>
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
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#706b57',
    backgroundColor: '#706b57',
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased height for a more pronounced shadow
    shadowOpacity: 0.25, // Increased opacity for a more pronounced shadow
    shadowRadius: 8, // Increased radius for a more pronounced shadow
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonText: {
    color: '#706b57',
    fontSize: 16,
  },
})
