import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import Loading from '../components/core/Loading'
import RefreshControl from '../components/core/RefreshControl'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'

const NotificationItem = ({ notification, onPress }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'follow':
        return 'account-plus'
      case 'cooked_your_recipe':
        return 'pot-steam'
      case 'liked_cook':
        return 'heart'
      case 'new_cook':
        return 'silverware-fork-knife'
      default:
        return 'bell'
    }
  }

  return (
    <TouchableOpacity style={styles.notificationItem} onPress={onPress}>
      <View style={styles.profilePicContainer}>
        {notification.profilePic ? (
          <Image source={{ uri: notification.profilePic }} style={styles.profilePic} />
        ) : (
          <Icon name='account-circle' size={50} color={theme.colors.softBlack} />
        )}
        <View style={styles.iconBadge}>
          <Icon name={getIcon()} size={16} color={theme.colors.primary} />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.notificationText}>{notification.message}</Text>
        <Text style={styles.timeText}>{notification.timeAgo}</Text>
      </View>
      {notification.dishPhoto && (
        <View style={styles.dishPhotoContainer}>
          <Image source={{ uri: notification.dishPhoto }} style={styles.dishPhoto} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const Notifications = ({ navigation }) => {
  const { notificationStore } = useStore()
  const notifications = [
    {
      id: '1',
      type: 'follow',
      message: 'Mike started following you',
      timeAgo: '1 hour ago',
      username: 'mike_cooking',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    },
    {
      id: '2',
      type: 'cooked_your_recipe',
      message: 'Sarah cooked Pasta Carbonara',
      timeAgo: '2 hours ago',
      username: 'sarah_chef',
      recipeId: '456',
      cookId: '789',
      profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      dishPhoto: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=200&fit=crop',
    },
    {
      id: '3',
      type: 'liked_cook',
      message: 'John liked your Chocolate Cake cook',
      timeAgo: '1 day ago',
      username: 'john_baker',
      cookId: '123',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      dishPhoto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
    },
    {
      id: '4',
      type: 'new_cook',
      message: 'Emma (who you follow) recorded a new Lasagna cook',
      timeAgo: '2 days ago',
      username: 'emma_foods',
      cookId: '234',
      profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      dishPhoto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=200&h=200&fit=crop',
    },
  ]
  const isLoading = false
  //   const { notifications, isLoading } = notificationStore

  //   useEffect(() => {
  //     notificationStore.loadNotifications()
  //   }, [])

  const handleRefresh = useCallback(async () => {
    //   await notificationStore.loadNotifications()
  }, [])

  const handleNotificationPress = notification => {
    switch (notification.type) {
      case 'follow':
        navigation.navigate('PublicProfile', { username: notification.username })
        break
      case 'cooked_your_recipe':
      case 'liked_cook':
      case 'new_cook':
        navigation.navigate('Cook', { cookId: notification.cookId })
        break
    }
  }

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => handleNotificationPress(item)} />
        )}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  )
}

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
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    alignItems: 'center',
  },
  profilePicContainer: {
    marginRight: 12,
    position: 'relative',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 4,
  },
  timeText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  emptyStateContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  dishPhotoContainer: {
    marginLeft: 12,
  },
  dishPhoto: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
})

export default observer(Notifications)
