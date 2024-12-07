import { useContext } from 'react'
import { AuthContext } from '../context/auth'
import CookedWebView from '../components/CookedWebView'

export default function ShoppingList({ navigation, route }) {
  const { credentials } = useContext(AuthContext)

  return (
    <CookedWebView
      startUrl={`http://192.168.1.96:3000/user/${credentials.username}/shopping-list`}
      navigation={navigation}
      route={route}
    />
  )
}
