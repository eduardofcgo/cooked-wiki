import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useStore } from '../context/StoreContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'
import { getProfileImageUrl } from '../urls'
import useCookedLikes from '../hooks/services/useCookedLikes'

const UserItem = observer(({ username, navigation }) => {
  return (
    <TouchableOpacity style={styles.userItem} onPress={() => navigation.navigate('PublicProfile', { username })}>
      <View style={styles.userInfo}>
        <Image source={{ uri: getProfileImageUrl(username) }} style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userName}>{username}</Text>
        </View>
      </View>
      {/* Placeholder for potential future actions */}
      <View></View>
    </TouchableOpacity>
  )
})

function CookedLikes({ route, navigation }) {
  const { cookedId } = route.params

  const { likes, loading, failed } = useCookedLikes({ cookedId })

  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = useMemo(() => {
    if (!likes) return []
    if (!searchQuery) return likes

    return likes.filter(username => username.toLowerCase().includes(searchQuery.toLowerCase()))
  
  }, [likes, searchQuery])

  return (
    <View style={styles.container}>
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

      {filteredUsers?.length > 0 ? (
        <FlatList
          data={filteredUsers}
          renderItem={({ item }) => <UserItem username={item} navigation={navigation} />}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>{searchQuery ? 'No users found.' : 'No likes yet.'}</Text>
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

export default observer(CookedLikes) 