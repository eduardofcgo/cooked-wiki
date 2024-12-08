import { Base64 } from 'js-base64';

import AuthStore from './store'
import { getAppLoginUrl, getCommunityJournalUrl } from '../urls'

export default class AuthService {

  static sessionKey = 'ring-session'
  
  static async login(username, password) {
    const response = await fetch(
      getAppLoginUrl(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      }
    )
    if (response.ok) {
      const cookies = response.headers.get('set-cookie')
      const session = cookies
        .split(';')
        .find(cookie => cookie.trim().startsWith(AuthService.sessionKey + '='))
        .split('=')[1].trim()

      const token = Base64.encodeURI(session)

      console.log('Setting credentials', username, session, token)
      
      await AuthStore.setCredentials(username, token)

      return { username, token }

    } else if (response.status === 401) {
      throw {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      }
    } else {
      throw {
        code: 'AUTH_SERVER_ERROR',
        message: 'Unable to connect to authentication server',
        status: response.status,
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
      session = Base64.decode(token)
    } catch (error) {
      console.error('Error decoding session token', error)

      await AuthStore.clearCredentials()
      
      return false
    }

    // Could be any URL that requires authentication
    const response = await fetch(getCommunityJournalUrl(), {
      headers: {
        'Cookie': `${AuthService.sessionKey}=${session}`
      }
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

  static async logout() {
    await AuthStore.clearCredentials()
  }
}
