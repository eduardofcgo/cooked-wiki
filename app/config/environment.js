import Constants from 'expo-constants'

const releaseChannel = Constants.expoConfig?.releaseChannel
const extraConfig = Constants.expoConfig?.extra || {}

const ENV = {
  development: {
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || extraConfig.BASE_URL,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || extraConfig.API_BASE_URL,
    FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID_HERE', // TODO: Add your Facebook App ID
  },
  production: {
    SENTRY_DSN: 'https://570c46d111c0446bb4632c2842c2374b@glitch.cooked.wiki/2',
    BASE_URL: 'https://cooked.wiki',
    API_BASE_URL: 'https://cooked.wiki/api',
    FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID_HERE', // TODO: Add your Facebook App ID
  },
}

function getEnvironment() {
  if (releaseChannel === 'development' || __DEV__) {
    return ENV.development
  }

  return ENV.production
}

export default getEnvironment()
