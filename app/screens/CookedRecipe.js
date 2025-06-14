import { observer } from 'mobx-react-lite'
import React, { lazy, useEffect, useState, Suspense } from 'react'
import { StyleSheet, View } from 'react-native'
import { useStore } from '../context/StoreContext'
import LoadingScreen from './Loading'
import { useAuth } from '../context/AuthContext'
import Recipe from './Recipe'
import useTryGetSimilarCooks from '../hooks/api/useSimilarCooks'

const RecipeCookedSheet = lazy(() => import('../components/recipe/RecipeCookedSheet'))

const CookedRecipe = observer(({ navigation, route }) => {
  const { cookedId, showShareCTA } = route.params
  const { cookedStore } = useStore()
  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  useEffect(() => {
    console.log('ensuring loaded', cookedId)
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(showShareCTA)

  // Load the recipe right away, and delay the bottom sheet
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(true)
  const [shouldLoadBottomSheet, setShouldLoadBottomSheet] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadBottomSheet(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const recipeId = cooked?.['recipe-id'] || route.params?.recipeId
  const extractId = cooked?.['extract-id'] || route.params?.extractId

  const { similarCooks, loadingSimilarCooks, loadNextPage, loadingNextPage, hasMoreSimilarCooks } =
    useTryGetSimilarCooks({ recipeId: recipeId || extractId })

  useEffect(() => {
    // TODO: lets do this reset here for now...
    if (recipeId || extractId) {
      navigation.setParams({
        recipeId: recipeId,
        extractId: extractId,
        queryParams: {},
      })
    }
  }, [recipeId, extractId, navigation])

  const handleShareNavigate = () => {
    setShouldShowShareCook(false)
    setTimeout(() => {
      navigation.navigate('ShareCooked', { cookedId })
    }, 1)
  }

  const handleDismissShareCookCTA = () => {
    setShouldShowShareCook(false)
  }

  const handleEdit = () => {
    navigation.navigate('EditCook', { cookedId })
  }

  return (
    <View style={styles.container}>
      <View style={{ zIndex: -10, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {shouldLoadRecipe ? <Recipe route={route} navigation={navigation} /> : <LoadingScreen />}
      </View>

      {shouldLoadBottomSheet && cooked && cookedLoadState !== 'loading' && (
        <Suspense fallback={null}>
          <RecipeCookedSheet
            cooked={cooked}
            cookedId={cookedId}
            similarCooks={similarCooks}
            loadingNextPage={loadingNextPage}
            hasMoreSimilarCooks={hasMoreSimilarCooks}
            loadNextPage={loadNextPage}
            onShare={handleShareNavigate}
            onEdit={handleEdit}
            shouldShowShareCook={shouldShowShareCook}
            onDismissShareCTA={handleDismissShareCookCTA}
            loggedInUsername={loggedInUsername}
            navigation={navigation}
          />
        </Suspense>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
})

export default CookedRecipe
