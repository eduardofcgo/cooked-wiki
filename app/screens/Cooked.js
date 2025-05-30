import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import LoadingScreen from './Loading'
import FreestyleCook from './FreestyleCook'
import CookedRecipe from './CookedRecipe'

const Cooked = observer(({ navigation, route }) => {
  const { cookedId } = route.params
  const { cookedStore } = useStore()

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  if (!cooked || cookedLoadState === 'loading') {
    return <LoadingScreen />
  }

  const recipeId = cooked?.['recipe-id']
  const extractId = cooked?.['extract-id']
  const hasRecipe = Boolean(recipeId || extractId)

  if (hasRecipe) {
    return <CookedRecipe navigation={navigation} route={route} />
  } else {
    return <FreestyleCook navigation={navigation} route={route} />
  }
})

export default Cooked
