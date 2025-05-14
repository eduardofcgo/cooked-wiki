import Constants from 'expo-constants'

const releaseChannel = Constants.expoConfig?.releaseChannel

const ENV = {
  development: {
    BASE_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:3000/api',
    sentryDSN: null,
  },
  production: {
    sentryDSN: 'https://570c46d111c0446bb4632c2842c2374b@glitch.cooked.wiki/2',
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
