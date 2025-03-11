import { useShareIntentContext } from 'expo-share-intent'
import { getExtractUrl } from '../urls'

import Recipe from './WebViews/Recipe'
import LoadingRecipe from './LoadingRecipe'

export default function Extract({ navigation, route }) {
  const { hasShareIntent, shareIntent } = useShareIntentContext()
  const extractUrl = hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  return (
    extractUrl && (
      <Recipe
        startUrl={getExtractUrl(extractUrl)}
        loadingComponent={<LoadingRecipe />}
        navigation={navigation}
        route={route}
      />
    )
  )
}
