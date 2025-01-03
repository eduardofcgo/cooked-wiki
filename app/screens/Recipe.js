import CookedWebView from '../components/CookedWebView'

export default function Recipe({ navigation, route }) {
  const { recipeUrl } = route.params

  return <CookedWebView startUrl={recipeUrl} navigation={navigation} route={route} disableRefresh={true} />
}
