import CookedWebView from '../components/CookedWebView'

export default function ShoppingList({ navigation, route }) {
  return (
    <CookedWebView
      startUrl='https://cooked.wiki/buy'
      navigation={navigation}
      route={route}
    />
  )
}
