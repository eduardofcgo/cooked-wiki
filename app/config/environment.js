import Constants from 'expo-constants'

const releaseChannel = Constants.expoConfig?.releaseChannel || 'development'

const ENV = {
  development: {
    BASE_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:3000/api',
  },
  production: {
    BASE_URL: 'https://cooked.wiki',
    API_BASE_URL: 'https://cooked.wiki/api',
  },
}

function getEnvironment() {
  if (releaseChannel === 'development') {
    return ENV.development
  }
  return ENV.production
}

export default getEnvironment()
