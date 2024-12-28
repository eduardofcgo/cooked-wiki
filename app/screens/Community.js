import React, { useEffect, useCallback, useState, memo } from 'react'
import Svg, { Path } from 'react-native-svg'
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Linking, Platform, Modal, FlatList } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'
import { observer } from 'mobx-react-lite'
import { useFocusEffect } from '@react-navigation/native'

import { getSavedRecipeUrl } from '../urls'

import { useStore } from '../context/store/StoreContext'
import { requestPushNotificationsPermission } from '../notifications/push'
import { theme } from '../style/style'
import { Button, PrimaryButton } from '../components/Button'
import Loading from '../components/Loading'
import RefreshControl from '../components/RefreshControl'
import DrawnArrow from '../components/DrawnArrow'
import CookedWebView from '../components/CookedWebView'
import { getCommunityJournalUrl } from '../urls'
import Cooked from '../components/Cooked/Cooked'

const CookedItem = memo(({ post, onUserPress, onRecipePress }) => (
  <Cooked post={post} onUserPress={onUserPress} onRecipePress={onRecipePress} />
))

export default Community = observer(({ navigation, route }) => {
  const { userStore, profileStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus
  const contactsPermissionStatus = userStore.contactsPermissionStatus

  const { hiddenNotificationsCard, hiddenFindFriendsCard } = userStore
  const {
    isLoadingFollowing,
    followingUsernames,
    communityFeed,
    isLoadingCommunityFeed,
    isLoadingCommunityFeedNextPage,
  } = profileStore

  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        await Promise.all([profileStore.loadFollowing(), profileStore.loadCommunityFeed()])
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
        onRecipePress={() => navigation.navigate('Recipe', { recipeUrl: getSavedRecipeUrl(post['recipe-id']) })}
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

  return (
    <View style={styles.container}>
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

      {isLoadingFollowing || (isLoadingCommunityFeed && communityFeed.length === 0) ? (
        <View style={styles.emptyStateContainer}>
          <Loading />
        </View>
      ) : followingUsernames.size === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Not following anyone.</Text>
          <Text style={styles.emptySearchText}>Follow your friends to see what they're cooking.</Text>
        </View>
      ) : (
        <FlatList
          data={communityFeed}
          renderItem={renderItem}
          keyExtractor={post => post.id}
          contentContainerStyle={styles.feedContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
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
    paddingBottom: 40,
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
})
