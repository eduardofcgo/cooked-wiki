import { useApi } from '../context/ApiContext'
import { useState, useCallback, useEffect } from 'react'
import NewExtractLoading from './NewExtractLoading'
import NewExtractError from './NewExtractError'
import { useNavigation, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'

const NewExtract = observer(({ url }) => {
  const apiClient = useApi()
  const route = useRoute()
  const navigation = useNavigation()

  const newExtractUrl = url || route.params?.url

  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleExtractUrl = useCallback(async () => {
    if (!newExtractUrl) return

    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post(
        '/new',
        {
          url: newExtractUrl,
        },
        {
          timeout: 60000,
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
  }, [newExtractUrl, apiClient, navigation])

  useEffect(() => {
    if (newExtractUrl) {
      handleExtractUrl()
    }
  }, [newExtractUrl, handleExtractUrl])

  if (!newExtractUrl) {
    return null
  }

  if (error) {
    return <NewExtractError errorMessage={error.message} onRetry={handleExtractUrl} />
  }

  if (isLoading) {
    return <NewExtractLoading />
  }

  return null
})

export default NewExtract
