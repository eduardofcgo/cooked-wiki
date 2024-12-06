import AuthStore from './store'

export default class AuthService {
  static async login(username, password) {
    const response = await fetch(
      `https://cooked.wiki/app/login?username=${username}&password=${password}`
    )
    if (response.ok) {
      const cookies = response.headers.get('set-cookie')
      await AuthStore.setCredentials(username, cookies)
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

  static async logout() {
    await AuthStore.clearCredentials()
  }
}
