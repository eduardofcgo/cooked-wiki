import CookedWebView from '../components/CookedWebView'
import { getCommunityJournalUrl } from '../urls'

export default function Community({ navigation, route }) {
  return (
    <CookedWebView
      startUrl={getCommunityJournalUrl()}
      navigation={navigation}
      route={route}
    />
  )
}
