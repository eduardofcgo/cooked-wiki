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
        <Loading backgroundColor='transparent' />
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
            onEndReachedThreshold={0.5} // Trigger when halfway through the last item
            ListFooterComponent={ListFooter}
            // We might need to adjust styling or add a contentContainerStyle
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
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  itemContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
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
