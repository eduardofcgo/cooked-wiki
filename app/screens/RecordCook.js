import React, { useEffect, useMemo } from 'react'
import { useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import RecordCook from '../components/recordcook/RecordCook'
import { useStore } from '../context/StoreContext'
import LoadingScreen from './Loading'
import GenericError from '../components/core/GenericError'

function RecordCookScreen() {
  const route = useRoute()

  const { recipeId, extractId } = route.params || {}
  const id = recipeId || extractId

  const { recipeMetadataStore } = useStore()
  const recipeMetadata = recipeMetadataStore.getMetadata(id)

  const metadataLoadState = recipeMetadataStore.getMetadataLoadState(id)

  useEffect(() => {
    if (id) {
      recipeMetadataStore.ensureLoadedMetadata(id)
    }
  }, [id])

  if (id) {
    if (!metadataLoadState || metadataLoadState === 'pending') {
      return <LoadingScreen />
    }

    if (metadataLoadState === 'error') {
      return <GenericError />
    }

    return <RecordCook editMode={false} preSelectedRecipe={recipeMetadata} />
  }

  return <RecordCook editMode={false} />
}

export default observer(RecordCookScreen)
