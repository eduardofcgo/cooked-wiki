import { useShareIntentContext } from 'expo-share-intent'

import { useApi } from '../context/ApiContext'
import { useEffect, useState, useCallback } from 'react'
import Loading from './Extract/Loading'
import Error from './Extract/Error'
import { useNavigation } from '@react-navigation/native'

export default function Extract({}) {
  const apiClient = useApi()
  const navigation = useNavigation()
  const { hasShareIntent, shareIntent, resetShareIntent, error: shareError } = useShareIntentContext()

  const sharedUrl = hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  const [error, setError] = useState(null)

  const handleExtractUrl = useCallback(async () => {
    if (!sharedUrl) return

    setError(null)

    try {
      const response = await apiClient.post(
        '/new',
        {
          url: sharedUrl,
        },
        {
          timeout: 25000,
        },
      )

      console.log('response', response)

      const extractionId = response?.['extraction-id']
      const recipeId = response?.['recipe-id']

      if (extractionId) {
        navigation.replace('Recipe', {
          extractId: extractionId,
        })
      } else if (recipeId) {
        navigation.replace('Recipe', {
          recipeId: recipeId,
        })
      }
    } catch (err) {
      console.error('Extraction error:', err)

      setError(err)
    }
  }, [sharedUrl, apiClient, navigation])

  useEffect(() => {
    if (sharedUrl) {
      console.log('sharedUrl', sharedUrl)
      handleExtractUrl()
    }
  }, [sharedUrl])

  if (!sharedUrl) {
    return null
  }

  if (error) {
    return <Error errorMessage={error.message} onRetry={handleExtractUrl} />
  }

  return <Loading />
}
