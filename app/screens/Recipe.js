import CookedWebView from '../components/CookedWebView'

export default function Recipe({ navigation, route }) {
  const recipeUrl = route.params.recipeUrl
  
  return (
    <CookedWebView
      startUrl={recipeUrl}
      navigation={navigation}
      route={route}
    />
  )
}
