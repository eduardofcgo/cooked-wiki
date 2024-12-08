import CookedWebView from '../components/CookedWebView'
import { useShareIntentContext } from 'expo-share-intent'
import { getExtractUrl } from '../urls'

export default function Extract({ navigation, route }) {
  const { hasShareIntent, shareIntent } = useShareIntentContext()
  const extractUrl =
    hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  return (
    extractUrl && (
      <CookedWebView
        startUrl={getExtractUrl(extractUrl)}
        navigation={navigation}
        route={route}
      />
    )
  )
}
