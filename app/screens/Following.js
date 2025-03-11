import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/store/StoreContext'
import { useAuth } from '../context/auth'
import LoadingScreen from '../screens/Loading'
import { Button, SecondaryButton, PrimaryButton } from '../components/Button'
import { theme } from '../style/style'

const UserItem = observer(({ username, isOwnProfile, navigation }) => {
  const { findFriendsStore } = useStore()

  return (
    <TouchableOpacity style={styles.userItem} onPress={() => navigation.navigate('PublicProfile', { username })}>
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Icon name='account' size={20} color={theme.colors.softBlack} />
        </View>
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

  const [following, setFollowing] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const canSearch = true // For now

  useEffect(() => {
    // TODO: separate into different components, for now let's keep it dumb.
    ;(async () => {
      if (!isOwnProfile) {
        // Viewing someone else's profile, load following from the API.
        const following = await profileStore.getFollowingUsernames(username)
        setFollowing(following)
        setIsLoading(false)
      } else {
        // Viewing your own profile, load following from the store.
        await profileStore.loadFollowing()
        setIsLoading(false)
      }
    })()
  }, [])

  const followingUsernames = !isOwnProfile ? following : Array.from(profileStore.followingUsernames)

  const filteredFollowing = useMemo(() => {
    if (!searchQuery) return followingUsernames
    return followingUsernames.filter(username => username.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [followingUsernames, searchQuery])

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

      {filteredFollowing.length > 0 ? (
        <FlatList
          data={filteredFollowing}
          renderItem={({ item }) => <UserItem username={item} isOwnProfile={isOwnProfile} navigation={navigation} />}
          keyExtractor={item => item}
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
