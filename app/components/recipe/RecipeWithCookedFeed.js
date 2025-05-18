import { observer } from 'mobx-react-lite'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import debounce from 'lodash.debounce'

import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
import { theme } from '../../style/style'
import FeedItem from '../cooked/FeedItem'
import Loading from '../core/Loading'
import CookedWebView from '../CookedWebView'
import SimilarCookedFeed from '../cooked/SimilarCookedFeed'
import RecordCookCTA from '../core/RecordCookCTA'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../../urls'

const RecipeWebView = forwardRef(
  (
    {
      recipeId,
      extractId,
      justSaved,
      webViewHeight,
      setWebViewHeight,
      navigation,
      onRequestPath,
      route,
      disableRefresh,
      loadingComponent,
      onWebViewReady,
      webViewReady,
    },
    ref,
  ) => {
    const startUrl = extractId
      ? getRecentExtractUrl(extractId)
      : getSavedRecipeUrl(recipeId) + (justSaved ? '?saved=true' : '')

    console.log('Openning recipe with url', startUrl)

    return (
      <View style={[styles.webViewContainer, { opacity: webViewReady ? 1 : 0 }]}>
        <CookedWebView
          ref={ref}
          startUrl={startUrl}
          style={{ height: webViewHeight }}
          dynamicHeight={true}
          onHeightChange={setWebViewHeight}
          navigation={navigation}
          onRequestPath={onRequestPath}
          route={route}
          disableRefresh={disableRefresh}
          loadingComponent={loadingComponent}
          onWebViewReady={onWebViewReady}
        />
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
          <TouchableOpacity onPress={() => navigation.navigate('RecordCook', { recipeId, extractId })}>
            <RecordCookCTA showText={true} description='Add your own notes and save to your journal.' />
            <Text style={{ color: theme.colors.softBlack, fontSize: 12, marginTop: 8 }}>
              Add your own notes and save to your journal.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  },
)

const RecipeWithCookedFeed = observer(
  ({ recipeId, extractId, justSaved, navigation, onRequestPath, route, disableRefresh, loadingComponent }) => {
    const { recipeJournalStore } = useStore()

    const id = recipeId || extractId

    const recipeCookeds = recipeJournalStore.getRecipeCooked(id)
    const isLoadingRecipeCookeds = recipeJournalStore.isLoadingRecipeCooked(id)
    const isLoadingRecipeCookedsNextPage = recipeJournalStore.isLoadingRecipeCookedsNextPage(id)
    const hasMore = recipeJournalStore.hasMoreRecipeCookeds(id)

    const [webViewHeight, setWebViewHeight] = useState(null)
    const [webViewReady, setWebViewReady] = useState(true)

    const onWebViewReady = useCallback(() => {
      // setWebViewReady(true)
    }, [])

    useEffect(() => {
      recipeJournalStore.loadCookeds(id)
    }, [id, recipeJournalStore])

    const debouncedSetWebViewHeight = useCallback(debounce(setWebViewHeight, 1000), [])

    const webViewRef = useRef(null)

    const injectScrollPosition = useCallback(
      scrollY => {
        if (webViewRef.current) {
          webViewRef.current.injectScrollPosition(scrollY)
        }
      },
      [webViewRef],
    )

    const handleScroll = useCallback(
      // TODO: should we throttle/debounce this?
      event => {
        const scrollY = event.nativeEvent.contentOffset.y
        injectScrollPosition(scrollY)
      },
      [injectScrollPosition],
    )

    const handleLoadMore = useCallback(() => {
      if (!isLoadingRecipeCookedsNextPage && hasMore) {
        recipeJournalStore.loadNextCookedsPage(id)
      }
    }, [isLoadingRecipeCookedsNextPage, hasMore, id, recipeJournalStore])

    const renderItem = ({ item: cooked }) => {
      return (
        <View style={{ paddingHorizontal: 16 }}>
          <FeedItem cooked={cooked} showRecipe={false} collapseNotes={false} />
        </View>
      )
    }

    const ListFooter = observer(() => {
      if (isLoadingRecipeCookedsNextPage) {
        return (
          <View style={styles.footer}>
            <Loading />
          </View>
        )
      }

      if (!isLoadingRecipeCookeds && !hasMore) {
        return (
          <View style={styles.footer}>
            <SimilarCookedFeed recipeId={id} />
          </View>
        )
      }

      return null
    })

    const ItemSeparatorComponent = useMemo(() => <View style={styles.itemSpacing} />, [])

    return (
      <View style={styles.container}>
        <FlatList
          data={webViewReady ? recipeCookeds : []}
          renderItem={renderItem}
          keyExtractor={cooked => cooked.id}
          contentContainerStyle={styles.feedContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          onScroll={handleScroll}
          ListHeaderComponent={
            <>
              <RecipeWebView
                ref={webViewRef}
                recipeId={recipeId}
                extractId={extractId}
                justSaved={justSaved}
                onScroll={handleScroll}
                webViewHeight={webViewHeight}
                setWebViewHeight={debouncedSetWebViewHeight}
                navigation={navigation}
                onRequestPath={onRequestPath}
                route={route}
                disableRefresh={disableRefresh}
                loadingComponent={loadingComponent}
                onWebViewReady={onWebViewReady}
                webViewReady={webViewReady}
              />
            </>
          }
          ListFooterComponent={ListFooter}
          ItemSeparatorComponent={ItemSeparatorComponent}
          nestedScrollEnabled={false}
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
  footer: {
    padding: 16,
  },
  itemSpacing: {
    height: 16,
  },
  feedContent: {
    paddingBottom: 20,
  },
  webViewContainer: {
    minHeight: 330,
  },
})

export default RecipeWithCookedFeed
