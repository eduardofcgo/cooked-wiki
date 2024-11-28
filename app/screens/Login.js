import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../components/Logo'
import LoadingScreen from '../screens/Loading'


export default function Login({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // TODO: change to post
      const response = await fetch(`https://cooked.wiki/app/login?username=${username}&password=${password}`);
      if (response.ok) {
        const cookies = response.headers.get('set-cookie');
        await AsyncStorage.setItem('cookies', cookies);
        await AsyncStorage.setItem('username', username);

        navigation.navigate('Main', { refresh: true, username: username })

      } else if (response.status === 401) {
        //const errorResponse = await response.json();
        alert("unauthorized");
      
      } else {
        alert('Unexpected response code');
      }
    } catch (error) {
      console.error(error)

      alert('Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <LoadingScreen />
          </View>
        )}

      <Text style={styles.helpText}>
        or
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
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
  appleButtonText: {
    color: '#000',
    fontSize: 16,
  },
});
