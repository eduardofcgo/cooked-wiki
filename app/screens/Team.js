import CookedWebView from '../components/CookedWebView'

export default function Team({ navigation, route }) {
  return (
    <CookedWebView
      startUrl={`http://192.168.1.96:3000/team`}
      navigation={navigation}
      route={route}
    />
  )
}
