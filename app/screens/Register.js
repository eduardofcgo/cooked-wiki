import CookedWebView from '../components/CookedWebView'

export default function Extract({ navigation, route }) {
  const onRequest = request => {
    const url = request.url

    if (url.match(/\/user\/.*/) || url.endsWith('/recipes')) {
      navigation.navigate('ProfileView', { refresh: true })

      return false
    }

    return true
  }

  return (
    <CookedWebView
      startUrl={`http://192.168.1.96:3000/register`}
      // onRequest={onRequest}
      navigation={navigation}
      route={route}
    />
  )
}
