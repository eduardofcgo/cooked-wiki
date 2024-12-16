import CookedWebView from '../components/CookedWebView'
import { getContactUrl } from '../urls'

export default function Contact({ navigation, route }) {
  return <CookedWebView startUrl={getContactUrl()} navigation={navigation} route={route} />
}
