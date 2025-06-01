import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
import GenericError from '../core/GenericError'
import { theme } from '../../style/style'
import FeedItem from '../cooked/FeedItem'
import Loading from '../core/Loading'
import RefreshControl from '../core/RefreshControl'
import ProfileStats from './ProfileStats'
import HeaderText from '../core/HeaderText'

const FlatList = FlashList

const FeedHeader = observer(({ username }) => {
  return (
    <>
      <ProfileStats username={username} />
      <HeaderText>Cooked journal</HeaderText>
    </>
  )
})

const ProfileCooked = observer(({ username, onScroll }) => {
  const { profileStore } = useStore()
  const profileCookeds = profileStore.getProfileCookeds(username)
  const isLoadingProfileCookeds = profileStore.isLoadingProfileCookeds(username)
  const isLoadingProfileCookedsNextPage = profileStore.isLoadingProfileCookedsNextPage(username)
  const hasMore = profileStore.hasMoreProfileCookeds(username)

  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        await profileStore.ensureLoadedFresh(username)
      } catch (e) {
        console.error(e)

        setError(e)
      }
    })()
  }, [username])

  const onRefresh = useCallback(async () => {
    ;(async () => {
      try {
        await profileStore.reloadProfileCooked(username)
      } catch (e) {
        console.error(e)

        setError(e)
      }
    })()
  }, [username])

  const renderItem = useCallback(
    ({ item: cooked }) => (
      <View style={{ marginBottom: 16 }}>
        <FeedItem cooked={cooked} rounded={true} showRecipe={cooked['recipe-id'] || cooked['extract-id']} />
      </View>
    ),
    [],
  )

  const handleLoadMore = useCallback(() => {
    if (!isLoadingProfileCookedsNextPage && hasMore && !error) {
      profileStore.loadNextProfileCookedsPage(username)
    }
  }, [isLoadingProfileCookedsNextPage, hasMore, username, profileStore, error])

  const ListFooter = useCallback(() => {
    if (isLoadingProfileCookedsNextPage) {
      return (
        <View style={styles.footerLoader}>
          <Loading />
        </View>
      )
    }
    return null
  }, [isLoadingProfileCookedsNextPage])

  if (error) {
    return (
      <GenericError
        status={error.status}
        customMessage={error.status === 401 && 'This user is private.'}
        onRetry={error.status !== 401 && error.status !== 404 && onRefresh}
      />
    )
  }

  if (isLoadingProfileCookeds) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={profileCookeds?.slice()}
        estimatedItemSize={50}
        onEndReachedThreshold={1}
        extraData={profileCookeds?.length}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feedContent}
        onEndReached={handleLoadMore}
        ListHeaderComponent={<FeedHeader username={username} />}
        ListFooterComponent={ListFooter}
        refreshControl={<RefreshControl refreshing={isLoadingProfileCookeds} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
  feedContent: {
    paddingBottom: 250,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ProfileCooked
