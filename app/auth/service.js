import AuthStore from './store'

export default class AuthService {

  static sessionKey = 'ring-session'
  
  static async login(username, password) {
    const response = await fetch(
      `http://192.168.1.96:3000/app/login`,
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
      const rawToken = cookies
        .split(';')
        .find(cookie => cookie.trim().startsWith(AuthService.sessionKey + '='))
        .split('=')[1].trim()

      const token = decodeURIComponent(rawToken)

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

    const response = await fetch('http://192.168.1.96:3000/community/journal', {
      headers: {
        'Cookie': `ring-session=${token}`
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
