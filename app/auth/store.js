import * as SecureStore from 'expo-secure-store'

export default class AuthStore {
  static async setCredentials(username, token) {
    await SecureStore.setItemAsync('username', username)
    await SecureStore.setItemAsync('token', token)
  }

  static async getCredentials() {
    const username = await SecureStore.getItemAsync('username')
    const token = await SecureStore.getItemAsync('token')

    if (username && token) {
      return { username, token }
    }

    return null
  }

  static async clearCredentials() {
    await SecureStore.deleteItemAsync('username')
    await SecureStore.deleteItemAsync('token')
  }
}
