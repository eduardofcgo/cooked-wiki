import CookedWebView from '../components/CookedWebView'

export default function Login({ navigation, route }) {
  const onBeforeLoad = request => {
    const url = request.url

    const userLoggedIn = url.endsWith('cooked.wiki/recipes')
    if (userLoggedIn) {
      navigation.navigate('Profile', { refresh: true })

      return false
    } else {
      return true
    }
  }

  const onLoad = e => {
    console.log('onload', e)
  }

  return (
    <CookedWebView
      startUrl='https://cooked.wiki/login'
      navigation={navigation}
      route={route}
      onBeforeLoad={onBeforeLoad}
      onLoad={onLoad}
    />
  )
}
