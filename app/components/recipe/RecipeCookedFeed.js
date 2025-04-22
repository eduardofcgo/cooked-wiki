import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

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

  const [webViewHeight, setWebViewHeight] = useState(300);

  useEffect(() => {
    recipeJournalStore.loadCookeds(recipeId)
  }, [recipeId, recipeJournalStore])

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

  const injectedJavaScript = `
    const ro = new ResizeObserver(entries => {
      window.ReactNativeWebView.postMessage(document.body.scrollHeight)
    });
    ro.observe(document.body);
    window.ReactNativeWebView.postMessage(document.body.scrollHeight);
    true;
  `;

  const handleWebViewMessage = (event) => {
    const height = parseInt(event.nativeEvent.data);
    if (!isNaN(height) && height !== webViewHeight) {
      setWebViewHeight(height);
    }
  };

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
          <WebView
            originWhitelist={['*']}
            source={{ uri: 'https://stackoverflow.com/questions/53764311/react-native-webview-flatlist-in-a-scrollview-to-be-scrollable' }}
            style={{ height: webViewHeight, marginBottom: 16 }}
            scrollEnabled={false}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        }
        ListFooterComponent={ListFooter}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        showsVerticalScrollIndicator={true}
      />
    </View>
  )
})

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
})

export default RecipeCookedFeed 