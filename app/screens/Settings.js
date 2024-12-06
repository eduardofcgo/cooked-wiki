import CookedWebView from '../components/CookedWebView'

export default function Settings({ navigation, route }) {
  return (
    <CookedWebView
      startUrl={`https://cooked.wiki/user`}
      navigation={navigation}
      route={route}
    />
  )
}
