import React, { useMemo } from 'react'
import { View } from 'react-native'
import RecordCook from '../components/recordcook/RecordCook'
import FadeInStatusBar from '../components/FadeInStatusBar'
import { useNavigation, useRoute } from '@react-navigation/native'
import { theme } from '../style/style'

export default function RecordCookScreen() {
  const route = useRoute()

  const { recipeId, extractId } = route.params || {}

  const preSelectedRecipe = useMemo(() => {
    return recipeId || extractId ? { recipeId, extractId } : undefined
  }, [recipeId, extractId])

  return <RecordCook editMode={false} preSelectedRecipe={preSelectedRecipe} />
}
