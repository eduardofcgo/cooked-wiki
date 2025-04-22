import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
import { theme } from '../../style/style'
import FeedItem from '../cooked/FeedItem'
import Loading from '../core/Loading'
import HeaderText from '../core/HeaderText'

const FeedHeader = observer(({ recipeName }) => {
  return (
    <>
      <HeaderText>Cooked by others</HeaderText>
      {recipeName && <Text style={styles.recipeName}>{recipeName}</Text>}
    </>
  )
})

const RecipeCookedFeed = observer(({ recipeId, recipeName }) => {
  const { recipeJournalStore } = useStore()
  const recipeCookeds = recipeJournalStore.getRecipeCooked(recipeId)
  const isLoadingRecipeCookeds = recipeJournalStore.isLoadingRecipeCooked(recipeId)
  const isLoadingRecipeCookedsNextPage = recipeJournalStore.isLoadingRecipeCookedsNextPage(recipeId)
  const hasMore = recipeJournalStore.hasMoreRecipeCookeds(recipeId)

  useEffect(() => {
    recipeJournalStore.loadCookeds(recipeId)
    const loadAll = async () => {
      while (recipeJournalStore.hasMoreRecipeCookeds(recipeId)) {
        await recipeJournalStore.loadNextCookedsPage(recipeId)
      }
    }
    loadAll()
  }, [recipeId, recipeJournalStore])

  const renderItem = useCallback((cooked) => <FeedItem key={cooked.id} cooked={cooked} rounded={true} />, [])

  const ListFooter = useCallback(() => {
    if (isLoadingRecipeCookedsNextPage) {
      return (
        <View style={styles.footerLoader}>
          <Loading />
        </View>
      )
    }
    return null
  }, [isLoadingRecipeCookedsNextPage])

  const EmptyComponent = useCallback(() => {
    if (!isLoadingRecipeCookeds && (!recipeCookeds || recipeCookeds.length === 0)) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No one has cooked this recipe yet.</Text>
          <Text style={styles.emptyStateText}>Be the first one!</Text>
        </View>
      )
    }
    return null
  }, [isLoadingRecipeCookeds, recipeCookeds])

  if (isLoadingRecipeCookeds && (!recipeCookeds || recipeCookeds.length === 0)) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <FeedHeader recipeName={recipeName} />
      {recipeCookeds && recipeCookeds.length > 0 ? (
        recipeCookeds.map((cooked, index) => (
          <View key={cooked.id} style={index > 0 ? styles.itemSpacing : null}>
            {renderItem(cooked)}
          </View>
        ))
      ) : (
        <EmptyComponent />
      )}
      <ListFooter />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginBottom: 8,
  },
  recipeName: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    marginBottom: 16,
  },
  footerLoader: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSpacing: {
    marginTop: 16,
  },
})

export default RecipeCookedFeed 