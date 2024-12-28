import React, { useCallback, useState, useEffect } from 'react'
import { View, FlatList, StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'

import { useStore } from '../context/store/StoreContext'
import { theme } from '../style/style'
import Loading from '../components/Loading'
import RefreshControl from '../components/RefreshControl'
import Cooked from '../components/Cooked/Cooked'
import ProfileStats from '../components/ProfileStats'
import { getSavedRecipeUrl } from '../urls'

const ProfileCookedHeader = observer(({ username }) => {
  return (
    <>
      <ProfileStats username={username} />

      <Text style={styles.headerText}>Recently cooked</Text>
    </>
  )
})

const ProfileCooked = observer(({ navigation, route, username }) => {
  const { profileStore } = useStore()
  const profileCookeds = profileStore.getProfileCookeds(username)
  const isLoadingProfileCookeds = profileStore.isLoadingProfileCookeds(username)
  const isLoadingProfileCookedsNextPage = profileStore.isLoadingProfileCookedsNextPage(username)
  const hasMore = profileStore.hasMoreProfileCookeds(username)

  useEffect(() => {
    profileStore.loadProfileCooked(username)
  }, [])

  const onRefresh = useCallback(async () => {
    await profileStore.reloadProfileCooked(username)
  }, [])

  const handleSave = useCallback(
    (id, newNotes, newCookedPhotosPath) => {
      profileStore.updateProfileCooked(username, id, newNotes, newCookedPhotosPath)
    },
    [username]
  )

  const renderItem = ({ item: post }) => (
    <Cooked
      post={post}
      hideAuthor={true}
      onSave={handleSave}
      onUserPress={() => {
        navigation.navigate('PublicProfile', { username: post.username })
      }}
      onRecipePress={() => {
        navigation.navigate('Recipe', { recipeUrl: getSavedRecipeUrl(post['recipe-id']) })
      }}
    />
  )

  const handleLoadMore = () => {
    if (!isLoadingProfileCookedsNextPage && hasMore) {
      profileStore.loadNextProfileCookedsPage(username)
    }
  }

  const ListFooter = () => {
    if (isLoadingProfileCookedsNextPage) {
      return (
        <View style={styles.footerLoader}>
          <Loading />
        </View>
      )
    }
    return null
  }

  if (isLoadingProfileCookeds && (!profileCookeds || profileCookeds.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    )
  }

  if (!profileCookeds || profileCookeds.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No cooked recipes yet.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={profileCookeds}
        renderItem={renderItem}
        keyExtractor={post => post.id.toString()}
        contentContainerStyle={styles.feedContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1}
        ListHeaderComponent={<ProfileCookedHeader username={username} />}
        ListFooterComponent={ListFooter}
        refreshControl={<RefreshControl refreshing={isLoadingProfileCookeds} onRefresh={onRefresh} />}
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
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  headerText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
    paddingBottom: 20,
  },
  feedContent: {
    paddingBottom: 20,
  },
  footerLoader: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ProfileCooked
