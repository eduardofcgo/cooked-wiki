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
        startUrl={`https://cooked.wiki/register`}
        onRequest={onRequest}
        navigation={navigation}
        route={route}/>
  )
}
