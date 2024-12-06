import CookedWebView from '../components/CookedWebView'

export default function Team({ navigation, route }) {
  return (
    <CookedWebView
      startUrl={`https://cooked.wiki/team`}
      navigation={navigation}
      route={route}
    />
  )
}
