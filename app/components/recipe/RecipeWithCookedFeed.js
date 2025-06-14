import { observer } from 'mobx-react-lite'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import debounce from 'lodash.debounce'

import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import FeedItem from '../cooked/FeedItem'
import Loading from '../core/Loading'
import CookedWebView from '../CookedWebView'
import SimilarCookedFeed from '../cooked/SimilarCookedFeed'
import RecordCookCTA from '../core/RecordCookCTA'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../../urls'
import GenericError from '../core/GenericError'

const FlatList = FlashList

const RecipeWebView = observer(
  forwardRef(
    (
      {
        recipeId,
        extractId,
        justSaved,
        savedExtractionId,
        cloned,
        webViewHeight,
        setWebViewHeight,
        navigation,
        onRequestPath,
        route,
        disableRefresh,
        loadingComponent,
        onWebViewReady,
        onHttpError,
      },
      ref,
    ) => {
      const startUrl = useMemo(() => {
        const baseUrl = extractId ? getRecentExtractUrl(extractId) : getSavedRecipeUrl(recipeId)
        const params = {
          ...(justSaved && { saved: 'true' }),
          ...(cloned && { cloned: 'true' }),
          ...(savedExtractionId && { savedExtractionId }),
        }
        const queryString = new URLSearchParams(params).toString()
        return baseUrl + (queryString ? `?${queryString}` : '')
      }, [recipeId, extractId, justSaved, cloned, savedExtractionId])

      return (
        <View style={[styles.webViewContainer]}>
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
            onHttpError={onHttpError}
            modalOffset={250 + StatusBar.currentHeight}
          />
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
            <TouchableOpacity onPress={() => navigation.navigate('RecordCook', { recipeId, extractId })}>
              <RecordCookCTA showText={true} description='Add your own notes and save to your journal.' />
            </TouchableOpacity>
            <Text
              style={{
                color: theme.colors.softBlack,
                fontSize: 12,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 16,
              }}
            >
              Add your own notes and save to your journal.
            </Text>
          </View>
        </View>
      )
    },
  ),
)

const ListFooter = observer(({ isLoadingRecipeCookedsNextPage, isLoadingRecipeCookeds, hasMore, id }) => {
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

const RecipeWithCookedFeed = observer(
  ({
    recipeId,
    extractId,
    justSaved,
    savedExtractionId,
    cloned,
    navigation,
    onRequestPath,
    route,
    disableRefresh,
    loadingComponent,
    onScroll,
    contentInsetTop,
    onTouchStart,
  }) => {
    const { recipeJournalStore, recentlyOpenedStore } = useStore()

    const id = recipeId || extractId

    const recipeCookeds = recipeJournalStore.getRecipeCooked(id)
    const isLoadingRecipeCookeds = recipeJournalStore.isLoadingRecipeCooked(id)
    const isLoadingRecipeCookedsNextPage = recipeJournalStore.isLoadingRecipeCookedsNextPage(id)
    const hasMore = recipeJournalStore.hasMoreRecipeCookeds(id)

    const [webViewHeight, setWebViewHeight] = useState(null)
    const [error, setError] = useState(null)

    const onWebViewReady = useCallback(() => {
      // For now let's display the webview right away, no loading state.
    }, [])

    const handleHttpError = useCallback(
      e => {
        if (e.statusCode == 404) {
          console.log('Not found recipe, removing from recently opened')
          recentlyOpenedStore.remove(recipeId)
        }

        setError(e)
      },
      [recipeId, recentlyOpenedStore],
    )

    useEffect(() => {
      recipeJournalStore.loadCookeds(id)
    }, [id, recipeJournalStore])

    // const debouncedSetWebViewHeight = useCallback(debounce(setWebViewHeight, 100), [])

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

        if (onScroll) {
          onScroll(event)
        }
      },
      [injectScrollPosition, onScroll],
    )

    const handleLoadMore = useCallback(() => {
      if (!isLoadingRecipeCookedsNextPage && hasMore) {
        recipeJournalStore.loadNextCookedsPage(id)
      }
    }, [isLoadingRecipeCookedsNextPage, hasMore, id, recipeJournalStore])

    const renderItem = ({ item: cooked }) => {
      return (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <FeedItem cooked={cooked} showRecipe={false} collapseNotes={false} />
        </View>
      )
    }

    if (error) {
      return <GenericError status={error.statusCode} />
    }

    return (
      <View style={styles.container} onTouchStart={onTouchStart}>
        <FlatList
          data={recipeCookeds?.slice()}
          estimatedItemSize={50}
          renderItem={renderItem}
          keyExtractor={cooked => cooked.id}
          contentContainerStyle={styles.feedContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View>
              <View style={{ height: contentInsetTop }} />
              <RecipeWebView
                ref={webViewRef}
                recipeId={recipeId}
                extractId={extractId}
                savedExtractionId={savedExtractionId}
                justSaved={justSaved}
                cloned={cloned}
                onScroll={handleScroll}
                webViewHeight={webViewHeight}
                // setWebViewHeight={debouncedSetWebViewHeight}
                setWebViewHeight={setWebViewHeight}
                navigation={navigation}
                onRequestPath={onRequestPath}
                route={route}
                disableRefresh={disableRefresh}
                loadingComponent={loadingComponent}
                onWebViewReady={onWebViewReady}
                onHttpError={handleHttpError}
              />
            </View>
          }
          ListFooterComponent={
            <ListFooter
              isLoadingRecipeCookedsNextPage={isLoadingRecipeCookedsNextPage}
              isLoadingRecipeCookeds={isLoadingRecipeCookeds}
              hasMore={hasMore}
              id={id}
            />
          }
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
