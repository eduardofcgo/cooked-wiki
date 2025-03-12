import { useAuth } from '../context/AuthContext'
import CookedWebView from '../components/CookedWebView'
import { getShoppingListUrl } from '../urls'

export default function ShoppingList({ navigation, route }) {
  const { credentials } = useAuth()

  return <CookedWebView startUrl={getShoppingListUrl(credentials.username)} navigation={navigation} route={route} />
}
