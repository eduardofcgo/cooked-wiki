import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View, Dimensions } from 'react-native'
import debounce from 'lodash.debounce'

import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
import { theme } from '../../style/style'
import FeedItem from '../cooked/FeedItem'
import Loading from '../core/Loading'
import HeaderText from '../core/HeaderText'
import CookedWebView from '../CookedWebView'

const RecipeWebView = ({
  startUrl,
  webViewHeight,
  debouncedSetWebViewHeight,
  navigation,
  onRequestPath,
  route,
  disableRefresh,
  loadingComponent,
}) => {
  return (
    <View style={styles.webViewContainer}>
      <CookedWebView
        startUrl={startUrl}
        style={{ minHeight: webViewHeight, height: webViewHeight, marginBottom: 16 }}
        dynamicHeight={true}
        onHeightChange={debouncedSetWebViewHeight}
        disableScroll={true}
        navigation={navigation}
        onRequestPath={onRequestPath}
        route={route}
        disableRefresh={disableRefresh}
        loadingComponent={loadingComponent}
      />
    </View>
  )
}

const RecipeWithCookedFeed = observer(
  ({ recipeId, startUrl, navigation, onRequestPath, route, disableRefresh, loadingComponent }) => {
    const { recipeJournalStore } = useStore()
    const recipeCookeds = recipeJournalStore.getRecipeCooked(recipeId)
    const isLoadingRecipeCookeds = recipeJournalStore.isLoadingRecipeCooked(recipeId)
    const isLoadingRecipeCookedsNextPage = recipeJournalStore.isLoadingRecipeCookedsNextPage(recipeId)
    const hasMore = recipeJournalStore.hasMoreRecipeCookeds(recipeId)

    const [webViewHeight, setWebViewHeight] = useState(Dimensions.get('window').height)

    useEffect(() => {
      recipeJournalStore.loadCookeds(recipeId)
    }, [recipeId, recipeJournalStore])

    // Debounce the height update function
    const debouncedSetWebViewHeight = useCallback(debounce(setWebViewHeight, 1000), [])

    const handleLoadMore = useCallback(() => {
      if (!isLoadingRecipeCookedsNextPage && hasMore) {
        recipeJournalStore.loadNextCookedsPage(recipeId)
      }
    }, [isLoadingRecipeCookedsNextPage, hasMore, recipeId, recipeJournalStore])

    const renderItem = useCallback(({ item: cooked }) => <FeedItem cooked={cooked} rounded={true} />, [])

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

    const ItemSeparatorComponent = useCallback(() => <View style={styles.itemSpacing} />, [])

    if (isLoadingRecipeCookeds && (!recipeCookeds || recipeCookeds.length === 0)) {
      return <LoadingScreen />
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={recipeCookeds}
          renderItem={renderItem}
          keyExtractor={cooked => cooked.id.toString()}
          contentContainerStyle={styles.feedContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          ListHeaderComponent={
            <RecipeWebView
              startUrl={startUrl}
              webViewHeight={webViewHeight}
              debouncedSetWebViewHeight={debouncedSetWebViewHeight}
              navigation={navigation}
              onRequestPath={onRequestPath}
              route={route}
              disableRefresh={disableRefresh}
              loadingComponent={loadingComponent}
            />
          }
          ListFooterComponent={ListFooter}
          ListEmptyComponent={EmptyComponent}
          ItemSeparatorComponent={ItemSeparatorComponent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        />
      </View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSpacing: {
    height: 16,
  },
  feedContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  webViewContainer: {
    minHeight: Dimensions.get('window').height,
  },
})

export default RecipeWithCookedFeed
