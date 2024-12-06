import { useContext } from 'react'
import { AuthContext } from '../context/auth'
import CookedWebView from '../components/CookedWebView'

export default function ShoppingList({ navigation, route }) {
  const { credentials } = useContext(AuthContext)

  return (
    <CookedWebView
      startUrl={`https://cooked.wiki/user/${credentials.username}/shopping-list`}
      navigation={navigation}
      route={route}
    />
  )
}
