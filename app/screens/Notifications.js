import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import Loading from '../screens/Loading'
import RefreshControl from '../components/core/RefreshControl'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import { useInAppNotification } from '../context/NotificationContext'
import ActionToast from '../components/notification/ActionToast'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import GenericError from '../components/core/GenericError'

const Image = FastImage
const FlatList = FlashList

const NotificationItem = observer(({ notification }) => {
  const navigation = useNavigation()
  const { notificationsStore } = useStore()
  const { showInAppNotification } = useInAppNotification()
  const swipeableRef = React.useRef(null)

  const getIcon = useCallback(() => {
    switch (notification['notification-type']) {
      case 'follow':
        return 'account-plus'
      case 'like':
        return 'heart'
      default:
        return 'bell'
    }
  }, [notification])

  const notificationNavigate = useCallback(() => {
    switch (notification['notification-type']) {
      case 'follow':
        notificationsStore.markNotificationAsRead(notification.id)
        navigation.navigate('PublicProfile', { username: notification.username })
        break

      case 'like':
        notificationsStore.markNotificationAsRead(notification.id)

        const id = notification['cooked-id']
        const recipeId = notification['extract-id'] || notification['recipe-id']

        if (recipeId) {
          navigation.navigate('CookedRecipe', { cookedId: id })
        } else {
          navigation.navigate('FreestyleCook', { cookedId: id })
        }
        break
    }
  }, [notification])

  const navigateToUser = useCallback(() => {
    navigation.navigate('PublicProfile', { username: notification.username })
  }, [notification])

  const getMessage = useCallback(() => {
    switch (notification['notification-type']) {
      case 'follow':
        return (
          <Text>
            <Text style={styles.boldText}>{notification.username}</Text>
            <Text> followed you</Text>
          </Text>
        )
      case 'like':
        return (
          <Text>
            <Text style={styles.boldText}>{notification.username}</Text>
            <Text> liked your cook</Text>
          </Text>
        )
      default:
        return null
    }
  }, [notification])

  const handleSwipeableOpen = useCallback(() => {
    if (!notification['is-read']) {
      notificationsStore.markNotificationAsRead(notification.id)
      showInAppNotification(ActionToast, {
        props: { message: 'Notification read', actionType: 'default' },
        resetQueue: true,
      })
    }

    if (swipeableRef.current) {
      swipeableRef.current.close()
    }
  }, [notification, notificationsStore, showInAppNotification])

  const renderSwipeAction = useCallback(() => {
    return (
      <View style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}>
        <Icon name='check' size={24} color={theme.colors.white} />
      </View>
    )
  }, [])

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderSwipeAction}
      onSwipeableOpen={handleSwipeableOpen}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
      enabled={!notification['is-read']}
    >
      <View style={styles.notificationItem}>
        <TouchableOpacity
          style={[styles.notificationItemContent, notification['is-read'] && { opacity: theme.opacity.disabled }]}
          onPress={notificationNavigate}
          activeOpacity={0.7}
        >
          <TouchableOpacity style={styles.profilePicContainer} onPress={navigateToUser}>
            <View style={styles.profilePicContainer}>
              {notification['profile-image-path'] ? (
                <Image source={{ uri: notification['profile-image-path'] }} style={styles.profilePic} />
              ) : (
                <Icon name='account-circle' size={50} color={theme.colors.softBlack} />
              )}
              <View style={styles.iconBadge}>
                <Icon name={getIcon()} size={16} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            <Text style={styles.notificationText}>{getMessage(notification)}</Text>
            <Text style={styles.timeText}>{moment(notification['created-at']).fromNow()}</Text>
          </View>
          {notification['liked-cook-image'] && (
            <View style={styles.dishPhotoContainer}>
              <Image source={{ uri: notification['liked-cook-image'] }} style={styles.dishPhoto} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Swipeable>
  )
})

const Notifications = ({ navigation }) => {
  const { notificationsStore } = useStore()
  const { showInAppNotification } = useInAppNotification()
  const headerHeight = useSharedValue(0)

  const notifications = notificationsStore.getNotifications()
  const isLoading = notificationsStore.getNotificationsLoadState() === 'pending'

  useEffect(() => {
    notificationsStore.refreshNotifications()
  }, [])

  useEffect(() => {
    if (!notificationsStore.hasNewNotifications && notifications?.length > 0) {
      headerHeight.value = withTiming(70, { duration: 500 })
    } else {
      headerHeight.value = withTiming(0, { duration: 300 })
    }
  }, [notificationsStore.hasNewNotifications, notifications])

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerHeight.value > 0 ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 200 }),
      overflow: 'hidden',
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        notificationsStore.hasNewNotifications && (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
            onPress={() => {
              notificationsStore.markAllNotificationsAsRead()
              showInAppNotification(ActionToast, {
                props: { message: 'All notifications read', actionType: 'default' },
                resetQueue: true,
              })
            }}
          >
            <Icon name='check-all' size={20} color={theme.colors.softBlack} />
          </TouchableOpacity>
        ),
    })
  }, [navigation, notificationsStore.hasNewNotifications, showInAppNotification])

  const handleRefresh = useCallback(async () => {
    notificationsStore.refreshNotifications()
  }, [])

  if (isLoading && !notificationsStore.getNotifications()) {
    return <Loading />
  }

  if (notificationsStore.getNotificationsLoadState() === 'rejected') {
    return <GenericError onRetry={handleRefresh} />
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications?.slice()}
        estimatedItemSize={200}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <View style={styles.headerContent}>
              <Icon name='check-all' size={16} color={theme.colors.softBlack} style={styles.headerIcon} />
              <Text style={styles.headerText}>All notifications read</Text>
            </View>
          </Animated.View>
        }
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
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  notificationItemContent: {
    flexDirection: 'row',
    padding: 16,
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
  boldText: {
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
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
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'android' && { paddingTop: 16 }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  headerText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  swipeAction: {
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    flexDirection: 'row',
  },
  swipeActionText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    marginLeft: 8,
  },
})

export default observer(Notifications)
