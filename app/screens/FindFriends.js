import React, { useState, useEffect } from 'react';
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
import { theme } from '../style/style';

export default function FindFriends({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual API calls
  const searchUsers = async (query) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults([
        { id: '1', username: 'gordon_ramsay', name: 'Gordon Ramsay', isFollowing: true },
        { id: '2', username: 'jamie_oliver', name: 'Jamie Oliver', isFollowing: false },
        // Add more mock data as needed
      ]);
      setLoading(false);
    }, 500);
  };

  const toggleFollow = async (userId) => {
    // TODO: Implement follow/unfollow API call
    setSearchResults(searchResults.map(user => 
      user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="account" size={24} color={theme.colors.softBlack} />
        </View>
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton,
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText,
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.softBlack} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

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
    fontFamily: theme.fonts.ui,
    fontWeight: '600',
    color: theme.colors.softBlack,
  },
  userHandle: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.gray,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.small,
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