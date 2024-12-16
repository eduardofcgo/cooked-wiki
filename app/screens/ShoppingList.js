import { useContext } from 'react'
import { AuthContext } from '../context/auth'
import CookedWebView from '../components/CookedWebView'
import { getShoppingListUrl } from '../urls'

export default function ShoppingList({ navigation, route }) {
  const { credentials } = useContext(AuthContext)

  return <CookedWebView startUrl={getShoppingListUrl(credentials.username)} navigation={navigation} route={route} />
}
