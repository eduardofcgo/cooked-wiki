import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
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

  useEffect(() => {
    profileStore.ensureLoadedFresh(username)
  }, [username])

  const onRefresh = useCallback(async () => {
    await profileStore.reloadProfileCooked(username)
  }, [username])

  const renderItem = useCallback(
    ({ item: cooked }) => (
      <FeedItem cooked={cooked} rounded={true} showRecipe={cooked['recipe-id'] || cooked['extract-id']} />
    ),
    [],
  )

  const handleLoadMore = useCallback(() => {
    if (!isLoadingProfileCookedsNextPage && hasMore) {
      profileStore.loadNextProfileCookedsPage(username)
    }
  }, [isLoadingProfileCookedsNextPage, hasMore, username, profileStore])

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

  const ItemSeparatorComponent = useCallback(() => <View style={{ height: 16 }} />, [])

  if (isLoadingProfileCookeds) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={profileCookeds.slice()}
        estimatedItemSize={50}
        onEndReachedThreshold={1}
        extraData={profileCookeds?.length}
        renderItem={renderItem}
        keyExtractor={post => post.id.toString()}
        contentContainerStyle={styles.feedContent}
        onEndReached={handleLoadMore}
        ListHeaderComponent={<FeedHeader username={username} />}
        ListFooterComponent={ListFooter}
        ItemSeparatorComponent={ItemSeparatorComponent}
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
