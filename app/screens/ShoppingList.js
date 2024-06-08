import CookedWebView from '../components/CookedWebView'

export default function ShoppingList({ navigation, route }) {
  const onBeforeLoad = request => {
    const url = request.url

    if (url.endsWith('cooked.wiki/recipes')) {
      navigation.navigate('Profile', { reset: true })

      return false
    } else {
      return true
    }
  }

  return (
    <CookedWebView
      startUrl='https://cooked.wiki/buy'
      navigation={navigation}
      route={route}
      onBeforeLoad={onBeforeLoad}
    />
  )
}
