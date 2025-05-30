import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as Linking from 'expo-linking'
import { theme } from '../style/style'

const TestDeepLinks = () => {
  const testUrls = [
    {
      title: 'Test User Profile',
      url: 'yourapp://user/testuser',
      description: 'Should navigate to PublicProfile with username=testuser',
    },
    {
      title: 'Test Cooked Recipe',
      url: 'yourapp://cooked/12345',
      description: 'Should navigate to CookedRecipe with cookedId=12345',
    },
    {
      title: 'Test Freestyle Cook',
      url: 'yourapp://freestyle/67890',
      description: 'Should navigate to FreestyleCook with cookedId=67890',
    },
    {
      title: 'Test Generate',
      url: 'yourapp://generate',
      description: 'Should navigate to Generate screen',
    },
  ]

  const handleTestUrl = async url => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`)
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open URL: ${error.message}`)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deep Link Testing</Text>
      <Text style={styles.subtitle}>Tap buttons to test deep link navigation</Text>

      {testUrls.map((item, index) => (
        <View key={index} style={styles.testItem}>
          <TouchableOpacity style={styles.button} onPress={() => handleTestUrl(item.url)}>
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.url}>{item.url}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    marginBottom: 30,
  },
  testItem: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.uiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    fontFamily: theme.fonts.ui,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
})

export default TestDeepLinks
