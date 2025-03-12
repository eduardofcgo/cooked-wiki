import { useFocusEffect } from '@react-navigation/native'
import * as Contacts from 'expo-contacts'
import * as Notifications from 'expo-notifications'
import { observer } from 'mobx-react-lite'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import Cooked from '../components/cooked/Cooked'
import { Button, PrimaryButton } from '../components/core/Button'
import DrawnArrow from '../components/core/DrawnArrow'
import Loading from '../components/core/Loading'
import RefreshControl from '../components/core/RefreshControl'
import { useStore } from '../context/StoreContext'
import { useInterval } from '../hooks/useInterval'
import { requestPushNotificationsPermission } from '../notifications/push'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'

const CookedItem = memo(({ post, onUserPress, onRecipePress }) => (
  <Cooked post={post} onUserPress={onUserPress} onRecipePress={onRecipePress} />
))

export default Community = observer(({ navigation, route }) => {
  const { userStore, profileStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus
  const contactsPermissionStatus = userStore.contactsPermissionStatus

  const { hiddenNotificationsCard, hiddenFindFriendsCard } = userStore
  const {
    followingUsernames,
    communityFeed,
    isLoadingCommunityFeed,
    isLoadingCommunityFeedNextPage,
    needsRefreshCommunityFeed,
  } = profileStore

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [notification, setNotification] = useState(null)
  const refreshPromptHeight = useSharedValue(0)
  const listRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      try {
        profileStore.loadCommunityFeed()
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useFocusEffect(() => {
    ;(async () => {
      const notificationPermission = await Notifications.getPermissionsAsync()
      userStore.setNotificationPermissionStatus(notificationPermission.status)

      const contactsPermission = await Contacts.getPermissionsAsync()
      userStore.setContactsPermissionStatus(contactsPermission.status)
    })()
  })

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
          onPress={handleAddFriends}>
          <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const handleAddFriends = async () => {
    navigation.navigate('FindFriends')
    // showNotification(
    //   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    //     <Icon name="account-search" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
    //     <Text style={{
    //       fontFamily: theme.fonts.medium,
    //       fontSize: theme.fontSizes.default,
    //       color: theme.colors.black
    //     }}>
    //       Find friends
    //     </Text>
    //   </View>
    // )
  }

  const handleEnableNotifications = async () => {
    const permission = await requestPushNotificationsPermission()

    if (permission.status === 'denied' && permission.canAskAgain) {
      userStore.setNotificationPermissionStatus(null)
    } else {
      userStore.setNotificationPermissionStatus(permission.status)
    }
  }

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Notifications.openSettings()
    } else {
      Linking.openSettings()
    }
  }

  const showNotificationsCard =
    notificationPermissionStatus !== 'granted' && userStore.enabledNotifications && !hiddenNotificationsCard
  const showFindFriendsCard = !hiddenFindFriendsCard

  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1, { duration: 1000 }),
              withTiming(1.05, { duration: 500 }),
              withTiming(1, { duration: 1000 })
            ),
            -1
          ),
        },
      ],
    }
  })

  const onRefresh = useCallback(async () => {
    await profileStore.loadCommunityFeed()
  }, [])

  const renderItem = useCallback(
    ({ item: post }) => (
      <CookedItem
        post={post}
        onUserPress={() => navigation.navigate('PublicProfile', { username: post.username })}
        onRecipePress={() => navigation.navigate('Recipe', { recipeId: post['recipe-id'] })}
      />
    ),
    [navigation]
  )

  const handleLoadMore = () => {
    if (!isLoadingCommunityFeedNextPage) {
      profileStore.loadNextCommunityFeedPage()
    }
  }

  const ListFooter = () => {
    if (isLoadingCommunityFeedNextPage) {
      return (
        <View style={styles.footerLoader}>
          <Loading />
        </View>
      )
    }
    return null
  }

  useInterval(() => {
    profileStore.checkNeedsRefreshCommunityFeed()
  }, 5000)

  const refreshPromptStyle = useAnimatedStyle(() => {
    return {
      height: refreshPromptHeight.value,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }
  })

  useEffect(() => {
    if (profileStore.needsRefreshCommunityFeed) {
      refreshPromptHeight.value = withSpring(40, {
        damping: 15,
        stiffness: 120,
      })
    } else {
      refreshPromptHeight.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      })
    }
  }, [profileStore.needsRefreshCommunityFeed])

  const handleRefreshPromptPress = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })

    profileStore.loadCommunityFeed()
  }

  return (
    <View style={styles.container}>
      <Reanimated.View style={refreshPromptStyle}>
        <TouchableOpacity onPress={handleRefreshPromptPress} style={styles.refreshPromptTouchable}>
          <Icon name='arrow-up' size={20} color={theme.colors.white} style={styles.refreshPromptIcon} />
          <Text style={styles.refreshPromptText}>New cooks! Pull to refresh.</Text>
        </TouchableOpacity>
      </Reanimated.View>

      {showNotificationsCard ||
        (showFindFriendsCard && (
          <View style={styles.cardsContainer}>
            {showNotificationsCard && (
              <View style={styles.swipeableContainer}>
                <ReanimatedSwipeable
                  containerStyle={{ overflow: 'visible' }}
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={styles.rightAction}
                      onPress={() => {
                        setIsModalVisible(true)
                      }}>
                      <Icon name='close' size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}>
                  <View style={styles.card}>
                    <View style={styles.iconContainer}>
                      <Icon name='bell-outline' size={20} color={theme.colors.softBlack} />
                    </View>
                    <View style={styles.contentContainer}>
                      <View style={styles.textContainer}>
                        <Text style={styles.description}>Get notified when your friends cook something new.</Text>
                      </View>
                      {notificationPermissionStatus === 'denied' ? (
                        <Button onPress={openSettings} style={styles.cardButton} title='Settings' />
                      ) : (
                        <PrimaryButton onPress={handleEnableNotifications} style={styles.cardButton} title='Turn on' />
                      )}
                    </View>
                  </View>
                </ReanimatedSwipeable>
              </View>
            )}

            {showFindFriendsCard && (
              <View style={styles.swipeableContainer}>
                <ReanimatedSwipeable
                  containerStyle={{ overflow: 'visible' }}
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={styles.rightAction}
                      onPress={() => {
                        setIsModalVisible(true)
                      }}>
                      <Icon name='close' size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}>
                  <View style={styles.card}>
                    <View style={styles.iconContainer}>
                      <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
                    </View>
                    <View style={styles.contentContainer}>
                      <View style={styles.textContainer}>
                        <Text style={styles.description}>Connect with your friends to see what they're cooking.</Text>
                      </View>
                      <PrimaryButton onPress={handleAddFriends} style={styles.cardButton} title='Add friends' />
                    </View>
                  </View>
                </ReanimatedSwipeable>
              </View>
            )}
          </View>
        ))}

      {isLoadingCommunityFeed ? (
        <View style={styles.emptyStateContainer}>
          <LoadingScreen />
        </View>
      ) : communityFeed.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No recent activity.</Text>
          <Text style={styles.emptySearchText}>Follow your friends to see what they're cooking.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={communityFeed}
          renderItem={renderItem}
          keyExtractor={post => post.id}
          contentContainerStyle={styles.feedContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          ListHeaderComponent={<View style={{ height: 16 }} />}
          ListFooterComponent={ListFooter}
          refreshControl={<RefreshControl refreshing={profileStore.isLoadingCommunityFeed} onRefresh={onRefresh} />}
        />
      )}

      <Modal visible={isModalVisible} transparent={true} animationType='fade'>
        <View style={styles.modalOverlay}>
          <Reanimated.View style={[pulseAnim]}>
            <View style={styles.clearCircle}>
              <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
            </View>
          </Reanimated.View>

          <View style={[styles.arrowContainer]}>
            <DrawnArrow />
          </View>

          <View style={styles.modalTouchable}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>You can always tap the icon at the top right corner to find friends.</Text>
              <View>
                <Button
                  title='Got it'
                  onPress={() => {
                    userStore.hideFindFriendsCard()

                    setIsModalVisible(false)
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardsContainer: {
    gap: 16,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#706b57',
    marginBottom: 8,
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.black,
    marginBottom: 0,
  },
  cardButton: {
    width: 95,
  },
  emptyStateContainer: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFriendsButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.default,
    fontWeight: 'bold',
    fontFamily: theme.fonts.ui,
  },
  swipeableContainer: {
    overflow: 'visible',
  },
  rightAction: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clearCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 5,
    marginRight: 5,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    top: 20,
    right: 40,
    transform: [{ rotate: '30deg' }],
  },
  modalContent: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptySearchText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginBottom: 24,
  },
  feedContainer: {
    flex: 1,
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
  refreshPromptText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  refreshPromptIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  refreshPromptTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
})
