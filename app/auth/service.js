import { btoa, atob, trimBase64Padding } from 'react-native-quick-base64'

import AuthStore from './store'
import { getAppLoginUrl, getCommunityJournalUrl, getGoogleLoginUrl } from '../urls'

export default class AuthService {
  static sessionKey = 'ring-session'

  static async login(username, headers) {
    const cookies = headers.get('set-cookie')
    const session = cookies
      .split(';')
      .find(cookie => cookie.trim().startsWith(AuthService.sessionKey + '='))
      .split('=')[1]
      .trim()

    const token = trimBase64Padding(btoa(session))

    console.log('Setting credentials', username)

    await AuthStore.setCredentials(username, token)

    return { username, token }
  }

  static async loginPassword(username, password) {
    const response = await fetch(getAppLoginUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.status === 200) {
      return AuthService.login(username, response.headers)
    } else if (response.status === 401 || response.status === 403) {
      throw {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password',
        status: response.status,
      }
    } else {
      throw {
        code: 'AUTH_SERVER_ERROR',
        message: 'Unable to connect to authentication server',
        status: response.status,
      }
    }
  }

  static async googleLogin(username, idToken) {
    const response = await fetch(getGoogleLoginUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'id-token': idToken }),
    })

    const responseData = await response.json()

    if (responseData.code === 'AUTHENTICATED') {
      return AuthService.login(username, response.headers)
    } else {
      throw {
        code: responseData.code,
        message: responseData.message,
      }
    }
  }

  static async validateStoredCredentials() {
    const credentials = await AuthStore.getCredentials()

    if (!credentials) {
      return null
    }

    const { token } = credentials
    let session

    try {
      session = atob(token)
    } catch (error) {
      console.error('Error decoding session token', error)

      await AuthStore.clearCredentials()

      return false
    }

    // Could be any URL that requires authentication
    const response = await fetch(getCommunityJournalUrl(), {
      headers: {
        Cookie: `${AuthService.sessionKey}=${session}`,
      },
    })
    const headers = response.headers
    const loggedUserHeader = headers.get('X-Logged-User')

    if (loggedUserHeader === 'null') {
      await AuthStore.clearCredentials()

      return false
    } else {
      return credentials
    }
  }

  static async getStoredCredentials() {
    return await AuthStore.getCredentials()
  }

  static async logout() {
    await AuthStore.clearCredentials()
  }
}
