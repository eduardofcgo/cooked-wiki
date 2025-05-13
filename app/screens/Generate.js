import { useApi } from '../context/ApiContext'
import { useState, useCallback, useEffect } from 'react'
import Loading from './Extract/Loading'
import Error from './Extract/Error'
import { useNavigation, useRoute } from '@react-navigation/native'

export default function Generate({ url }) {
  const apiClient = useApi()
  const route = useRoute()
  const navigation = useNavigation()

  console.log('Generate', url, route.params)

  const generateUrl = url || route.params?.url

  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleExtractUrl = useCallback(async () => {
    if (!generateUrl) return

    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post(
        '/new',
        {
          url: generateUrl,
        },
        {
          timeout: 25000,
        },
      )

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
      setIsLoading(false)
    }
  }, [generateUrl, apiClient, navigation])

  // Call handleExtractUrl when the component mounts
  useEffect(() => {
    if (generateUrl) {
      console.log('URL to extract:', generateUrl)
      handleExtractUrl()
    }
  }, [generateUrl, handleExtractUrl])

  if (!generateUrl) {
    return null
  }

  if (error) {
    return <Error errorMessage={error.message} onRetry={handleExtractUrl} />
  }

  if (isLoading) {
    return <Loading />
  }

  return null
}
