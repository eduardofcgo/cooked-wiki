import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import LoadingScreen from '../../screens/Loading'
import { theme } from '../../style/style'
import Cooked from '../cooked/Cooked'
import Loading from '../core/Loading'
import RefreshControl from '../core/RefreshControl'
import ProfileStats from './ProfileStats'

const FeedHeader = observer(({ username }) => {
  return (
    <>
      <ProfileStats username={username} />

      <Text style={styles.headerText}>Cooked journal</Text>
    </>
  )
})

const ProfileCooked = observer(({ navigation, route, username }) => {
  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  const { profileStore } = useStore()
  const profileCookeds = profileStore.getProfileCookeds(username)
  const isLoadingProfileCookeds = profileStore.isLoadingProfileCookeds(username)
  const isLoadingProfileCookedsNextPage = profileStore.isLoadingProfileCookedsNextPage(username)
  const hasMore = profileStore.hasMoreProfileCookeds(username)

  useEffect(() => {
    profileStore.loadProfileCooked(username)
  }, [username])

  const onRefresh = useCallback(async () => {
    await profileStore.reloadProfileCooked(username)
  }, [username])

  const renderItem = ({ item: post }) => (
    <Cooked
      post={post}
      canEdit={loggedInUsername === username}
      hideAuthor={true}
      onUserPress={() => {
        navigation.navigate('PublicProfile', { username: post.username })
      }}
      onRecipePress={() => {
        navigation.navigate('Recipe', { recipeId: post['recipe-id'] })
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

  if (isLoadingProfileCookeds) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      {/* {profileCookeds?.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recipes cooked yet.</Text>
          </View>
        ) : ( */}
      <FlatList
        data={profileCookeds}
        renderItem={renderItem}
        keyExtractor={post => post.id.toString()}
        contentContainerStyle={styles.feedContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1}
        ListHeaderComponent={<FeedHeader username={username} />}
        ListFooterComponent={ListFooter}
        refreshControl={<RefreshControl refreshing={isLoadingProfileCookeds} onRefresh={onRefresh} />}
      />
      {/* )} */}
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
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
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
