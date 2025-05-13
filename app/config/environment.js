import Constants from 'expo-constants'

const releaseChannel = Constants.expoConfig?.releaseChannel

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
  if (releaseChannel === 'development' || __DEV__) {
    return ENV.development
  }

  return ENV.production
}

export default getEnvironment()
