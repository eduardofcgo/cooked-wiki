import CookedWebView from '../components/CookedWebView'

export default function Recipe({ navigation, route }) {
  const recipeUrl = route.params.recipeUrl

  const onRequest = request => {
    const url = request.url

    if (url.endsWith('/shopping-list') || url.endsWith('/buy')) {
      navigation.navigate('ShoppingList', { refresh: true })
      
      return false
    }
    
    return true
  }

  return (
    <CookedWebView
      startUrl={recipeUrl}
      navigation={navigation}
      onRequest={onRequest}
      route={route}
    />
  )
}
