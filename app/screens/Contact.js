import CookedWebView from '../components/CookedWebView'

export default function Contact({ navigation, route }) {
  return (
    <CookedWebView
      startUrl='http://192.168.1.96:3000/contact'
      navigation={navigation}
      route={route}
    />
  )
}
