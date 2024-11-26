import CookedWebView from '../components/CookedWebView'

export default function Community({ navigation, route }) {
  const onRequest = request => {
    const url = request.url

    if (url.match(/\/user\/.*/) || url.endsWith('/recipes')) {
      return true
    }

    if (/\/saved\/[a-zA-Z0-9]+/.test(url)) {
      navigation.navigate('Recipe', { recipeUrl: url })

      return false
    }

    return false
  }

  return (
    <CookedWebView
      startUrl={'https://cooked.wiki/community'}
      navigation={navigation}
      route={route}
      onRequest={onRequest}
    />
  )
}
