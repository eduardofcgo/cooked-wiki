import React, { useCallback, useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Loading from '../../components/core/Loading'
import HeaderText from '../../components/core/HeaderText'
import { theme } from '../../style/style'
import FeedItem from './FeedItem'
import useTryGetSimilarCooks from '../../hooks/services/useSimilarCooks'

export default function SimilarCookedFeed({ recipeId }) {
  const { similarCooks, loadingSimilarCooks, loadNextPage, loadingNextPage } = useTryGetSimilarCooks({ recipeId })
  const lastItemRef = useRef(null)

  const onLastItemLayout = useCallback(() => {
    if (!loadingNextPage && !loadingSimilarCooks) {
      loadNextPage()
    }
  }, [loadingNextPage, loadingSimilarCooks, loadNextPage])

  return (
    <View style={styles.container} collapsable={false}>
      {loadingSimilarCooks ? (
        <Loading backgroundColor='transparent' />
      ) : (
        <>
          {similarCooks?.length > 0 ? (
            <>
              <View>
                <HeaderText>Similar Cooked</HeaderText>
              </View>
              {similarCooks.map((cooked, index) => (
                <View
                  key={index}
                  style={{ marginBottom: 16 }}
                  ref={index === similarCooks.length - 1 ? lastItemRef : null}
                  onLayout={index === similarCooks.length - 1 ? onLastItemLayout : undefined}
                >
                  <FeedItem cooked={cooked} rounded={true} />
                </View>
              ))}

              {loadingNextPage && (
                <View style={styles.loadingMore}>
                  <Loading size='small' backgroundColor='transparent' />
                </View>
              )}
            </>
          ) : // let's fail silently for the user
          null}
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
