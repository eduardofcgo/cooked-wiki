import CookedWebView from '../components/CookedWebView'
import { getTeamUrl } from '../urls'

export default function Team({ navigation, route }) {
  return (
    <CookedWebView
      startUrl={getTeamUrl()}
      navigation={navigation}
      route={route}
    />
  )
}
