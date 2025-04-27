import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native'
import Loading from '../../components/core/Loading'
import HeaderText from '../../components/core/HeaderText'
import { theme } from '../../style/style'
import FeedItem from './FeedItem'
import useTryGetSimilarCooks from '../../hooks/services/useSimilarCooks'

export default function SimilarCookedFeed({ recipeId }) {
  const { similarCooks, loadingSimilarCooks, loadNextPage, loadingNextPage, hasMoreSimilarCooks } =
    useTryGetSimilarCooks({ recipeId })

  const handleLoadMore = useCallback(() => {
    console.log('SimilarCookedFeed: loadMore', loadingNextPage, hasMoreSimilarCooks)

    if (!loadingNextPage && hasMoreSimilarCooks) {
      console.log('SimilarCookedFeed: Triggering loadNextPage via onEndReached')
      loadNextPage()
    }
  }, [loadingNextPage, hasMoreSimilarCooks, loadNextPage])

  const renderCookedItem = useCallback(
    ({ item: cooked }) => (
      <View style={styles.itemContainer}>
        <FeedItem cooked={cooked} rounded={true} />
      </View>
    ),
    [],
  )

  const keyExtractor = useCallback(item => item.id.toString(), [])

  const ListFooter = useMemo(() => {
    if (loadingNextPage) {
      return (
        <View style={styles.loadingMore}>
          <Loading size='small' backgroundColor='transparent' />
        </View>
      )
    }
    return null
  }, [loadingNextPage])

  return (
    <View style={styles.container} collapsable={false}>
      {loadingSimilarCooks ? (
        <View style={styles.loadingContainer}>
          <Loading backgroundColor='transparent' />
        </View>
      ) : (
        <>
          {similarCooks?.length > 0 && (
            <View style={styles.headerContainer}>
              <HeaderText>Similar Cooked</HeaderText>
            </View>
          )}
          <FlatList
            data={similarCooks}
            renderItem={renderCookedItem}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooter}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            contentContainerStyle={styles.flatListContent}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingBottom: 100,
  },
  flatListContent: {},
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  itemContainer: {
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.gray,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  loadingMore: {
    padding: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
})
