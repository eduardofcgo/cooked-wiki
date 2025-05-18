import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { PrimaryButton } from '../components/core/Button'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'
import useFollowers from '../hooks/api/useFollowers'

const Image = FastImage

const FlatList = FlashList

const UserItem = observer(({ username, imageUrl, navigation }) => {
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
    </TouchableOpacity>
  )
})

function Followers({ route, navigation }) {
  const { username } = route.params

  const { credentials } = useAuth()
  const loggedInUsername = credentials?.username
  const isOwnProfile = username === loggedInUsername

  const { followers, loading: isLoading, failed } = useFollowers({ username })
  const [searchQuery, setSearchQuery] = useState('')

  const canSearch = true

  const filteredFollowers = useMemo(() => {
    if (!searchQuery) return followers || []

    return followers?.filter(username => username.toLowerCase().includes(searchQuery.toLowerCase())) || []
  }, [followers, searchQuery])

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

      {filteredFollowers.length > 0 ? (
        <FlatList
          data={filteredFollowers?.slice()}
          estimatedItemSize={100}
          renderItem={({ item }) => (
            <UserItem username={item.username} imageUrl={item['profile-image-url']} navigation={navigation} />
          )}
          keyExtractor={item => item.username}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <>
          <Text style={styles.emptyText}>{searchQuery ? 'No users found.' : 'No followers yet.'}</Text>
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

export default observer(Followers)
