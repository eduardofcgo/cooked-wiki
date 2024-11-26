import CookedWebView from '../components/CookedWebView'

export default function ShoppingList({ navigation, route }) {
  const onRequest = request => {
    const url = request.url

    if (url.endsWith('/shopping-list') || url.endsWith('/buy')) {
      return true
    }

    if (url.endsWith('/contact')) {
      navigation.navigate('Contact')

      return false
    }

    if (/\/saved\/[a-zA-Z0-9]+/.test(url)) {
      navigation.navigate('Recipe', { recipeUrl: url })

      return false
    }

    return false
  }

    // if (url.endsWith('cooked.wiki/recipes')) {
    //   navigation.navigate('Profile', { reset: true })

    //   return false
    // } else {
    //   return true
    // }


  return (
    <CookedWebView
      startUrl='https://cooked.wiki/buy'
      navigation={navigation}
      route={route}
      onRequest={onRequest}
    />
  )
}
