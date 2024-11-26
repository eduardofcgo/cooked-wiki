import CookedWebView from '../components/CookedWebView'

export default function Contact({ navigation, route }) {
  return (
    <CookedWebView
      startUrl='https://cooked.wiki/contact'
      navigation={navigation}
      route={route}
    />
  )
}
