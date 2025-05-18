import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { PrimaryButton } from '../components/core/Button'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'
import useFollowing from '../hooks/api/useFollowing'

const Image = FastImage
const FlatList = FlashList

const UserItem = observer(({ username, imageUrl, isOwnProfile, navigation }) => {
  return (
    <TouchableOpacity style={styles.userItem} onPress={() => navigation.navigate('PublicProfile', { username })}>
      <View style={styles.userInfo}>
        <Image source={{ uri: imageUrl }} style={styles.avatarPlaceholder} />
        {/* <View style={styles.avatarPlaceholder}>
          <Icon name='account' size={20} color={theme.colors.softBlack} />
        </View> */}
        <View>
          <Text style={styles.userName}>{username}</Text>
        </View>
      </View>

      {/* For now lets do not allow to unfollow from the following screen */}
      <View></View>

      {/* {isOwnProfile ? (
        <SecondaryButton
          title='Following'
          style={styles.toggleFollowButton}
          onPress={() => findFriendsStore.unfollow(username)}
        />
      ) : (
        <View></View>
      )} */}
    </TouchableOpacity>
  )
})

function Following({ route, navigation }) {
  const { username } = route.params

  const { credentials } = useAuth()
  const loggedInUsername = credentials?.username
  const isOwnProfile = username === loggedInUsername

  const { profileStore } = useStore()

  // TODO: for now lets's have the loading state in th component
  // soon we will use promises in the store which will allow to save the state in the store
  const [loadingFollowingFromStore, setLoadingFollowingFromStore] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const canSearch = true // For now

  useEffect(() => {
    // TODO: separate into different components, for now let's keep it very ugly.
    ;(async () => {
      if (isOwnProfile) {
        setLoadingFollowingFromStore(true)
        await profileStore.loadFollowing()
        setLoadingFollowingFromStore(false)
      }
    })()
  }, [])

  // TODO: separate into different components, for now let's keep it very ugly.
  let followingUsers
  let isLoading = false

  if (isOwnProfile) {
    followingUsers = Array.from(profileStore.followingUsers.values())
    isLoading = loadingFollowingFromStore
  } else {
    const followingResponseFromHook = useFollowing({ username })
    followingUsers = followingResponseFromHook.following
    isLoading = followingResponseFromHook.loading
  }

  const filteredFollowing = useMemo(() => {
    if (!searchQuery) return followingUsers

    return followingUsers?.filter(({ username }) => username.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [followingUsers, searchQuery])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      {canSearch && (
        <View style={styles.searchContainer}>
          <Icon name='magnify' size={20} color={theme.colors.softBlack} />
          <TextInput
            style={styles.searchInput}
            placeholder='Search by username'
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={theme.colors.primary}
            autoCapitalize='none'
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name='close' size={20} color={theme.colors.softBlack} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {filteredFollowing?.length > 0 ? (
        <FlatList
          data={filteredFollowing?.slice()}
          estimatedItemSize={100}
          renderItem={({ item }) => (
            <UserItem
              username={item.username}
              imageUrl={item['profile-image-url']}
              isOwnProfile={isOwnProfile}
              navigation={navigation}
            />
          )}
          keyExtractor={item => item.username}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <>
          <Text style={styles.emptyText}>{searchQuery ? 'No users found.' : 'Not following anyone yet.'}</Text>
          {isOwnProfile && <PrimaryButton title='Find friends' onPress={() => navigation.navigate('FindFriends')} />}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  toggleFollowButton: {
    width: 85,
  },
  emptyText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.secondary,
    margin: 16,
    marginBottom: 0,
    borderRadius: theme.borderRadius.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
  },
})

export default observer(Following)
