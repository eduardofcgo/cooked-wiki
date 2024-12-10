import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/store/StoreContext'

import RefreshControl from '../components/RefreshControl';
import Loading from '../components/Loading';
import { Button, PrimaryButton, SecondaryButton } from '../components/Button';
import { theme } from '../style/style';
import { ApiContext } from '../context/api';

const UserItem = observer(({ user, navigation }) => {  
  const { findFriendsStore } = useStore()

  return (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => navigation.navigate('PublicProfile', { username: user.username })}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="account" size={20} color={theme.colors.softBlack} />
        </View>
        <View>
          <Text 
            style={styles.userName} 
            color={theme.colors.black}>{user.username}</Text>
        </View>
      </View>

      {user["is-following"] ? (
        <SecondaryButton 
          title="Following"
          style={styles.toggleFollowButton}
          onPress={() => findFriendsStore.unfollow(user.username)}
        />
      ) : (
        <Button 
          title="Follow" 
          style={styles.toggleFollowButton} 
          onPress={() => findFriendsStore.follow(user.username)}
        />
      )}
    </TouchableOpacity>
  )
})

function FindFriends({ navigation }) {
  const { findFriendsStore } = useStore()
  const { isEmptySearch, searchQuery, users, loading } = findFriendsStore
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      findFriendsStore.resetSearch();
    });

    return unsubscribe;
  }, [navigation])
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.softBlack} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends"
          value={searchQuery}
          onChangeText={(query) => findFriendsStore.setSearchQuery(query)}
          selectionColor={theme.colors.primary}
          autoCapitalize="none"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => findFriendsStore.resetSearch()}>
            <Icon name="close" size={20} color={theme.colors.softBlack} />
          </TouchableOpacity>
        ) : null}
      </View>


      {loading ? (
        <Loading />
      ) : (
        isEmptySearch ? (
          <Text style={styles.emptySearchText}>
            Search for friends by username
          </Text>
        ) : (
          users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={({ item }) => <UserItem user={item} navigation={navigation} />}
              keyExtractor={(item) => item.username}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.emptySearchText}>
              No users found
            </Text>
          )
        )
      )}
    </View>
  )
}

export default observer(FindFriends)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.secondary,
    margin: 16,
    borderRadius: theme.borderRadius.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
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
  userHandle: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.gray,
  },
  toggleFollowButton: {
    width: 85,
  },
  followingButton: {
    backgroundColor: theme.colors.secondary,
  },
  followButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    fontWeight: '600',
  },
  followingButtonText: {
    color: theme.colors.softBlack,
  },
  loader: {
    marginTop: 20,
  },
}); 