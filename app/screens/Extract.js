import { useShareIntentContext } from 'expo-share-intent'
import { getExtractUrl } from '../urls'

import LoadingRecipe from './LoadingRecipe'
import Recipe from './webviews/Recipe'

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
