import { useFocusEffect } from '@react-navigation/native'
import * as Contacts from 'expo-contacts'
import * as Notifications from 'expo-notifications'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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

import { FindFriendsOnboardingModal } from '../components/community/FindFriendsOnboardingModal'
import FeedItem from '../components/cooked/FeedItem'
import { Button, PrimaryButton } from '../components/core/Button'
import HeaderTitleMenu from '../components/core/HeaderTitleMenu'
import Loading from '../components/core/Loading'
import RefreshControl from '../components/core/RefreshControl'
import AnimatedBell from '../components/notification/AnimatedBell'
import { useStore } from '../context/StoreContext'
import { useInterval } from '../hooks/useInterval'
import { requestPushNotificationsPermission } from '../notifications/push'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'

export default Community = observer(({ navigation, route }) => {
  const { userStore, profileStore, onboardingStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus
  const contactsPermissionStatus = userStore.contactsPermissionStatus

  const { hiddenNotificationsCard } = userStore

  const {
    followingUsernames,
    communityFeed,
    isLoadingCommunityFeed,
    isLoadingCommunityFeedNextPage,
    needsRefreshCommunityFeed,
  } = profileStore

  const [clickedAddFriendsCard, setClickedAddFriendsCard] = useState(false)

  const [findFriendsOnboardingModalVisible, setFindFriendsOnboardingModalVisible] = useState(false)
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

    if (clickedAddFriendsCard) {
      setClickedAddFriendsCard(false)
      setFindFriendsOnboardingModalVisible(true)
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitleMenu title='Community' reverse={true}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <AnimatedBell />
          </TouchableOpacity>
        </HeaderTitleMenu>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
          onPress={handleAddFriends}
        >
          <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const handleAddFriendsCard = useCallback(() => {
    navigation.navigate('FindFriends')
    setClickedAddFriendsCard(true)
  }, [navigation])

  const handleAddFriends = useCallback(() => {
    navigation.navigate('FindFriends')
  }, [navigation])

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
  const showFindFriendsCard = onboardingStore.showFindFriendsHint()

  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1, { duration: 1000 }),
              withTiming(1.05, { duration: 500 }),
              withTiming(1, { duration: 1000 }),
            ),
            -1,
          ),
        },
      ],
    }
  })

  const onRefresh = useCallback(async () => {
    await profileStore.loadCommunityFeed()
  }, [])

  const onNotesPress = useCallback(() => {
    navigation.navigate('Recipe', { recipeId: cooked['recipe-id'] })
  }, [navigation])

  const renderItem = useCallback(({ item: cooked }) => <FeedItem cooked={cooked} rounded={true} />, [])

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
                        setFindFriendsOnboardingModalVisible(true)
                      }}
                    >
                      <Icon name='close' size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                >
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
                        setFindFriendsOnboardingModalVisible(true)
                      }}
                    >
                      <Icon name='close' size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                >
                  <View style={styles.card}>
                    <View style={styles.iconContainer}>
                      <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
                    </View>
                    <View style={styles.contentContainer}>
                      <View style={styles.textContainer}>
                        <Text style={styles.description}>Connect with your friends to see what they're cooking.</Text>
                      </View>
                      <PrimaryButton onPress={handleAddFriendsCard} style={styles.cardButton} title='Add friends' />
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
          keyExtractor={cooked => cooked.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          ListFooterComponent={ListFooter}
          refreshControl={<RefreshControl refreshing={profileStore.isLoadingCommunityFeed} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 16, paddingVertical: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}

      <FindFriendsOnboardingModal
        visible={findFriendsOnboardingModalVisible}
        onClose={() => {
          onboardingStore.markFindFriendsHintAsShown()
          setFindFriendsOnboardingModalVisible(false)
        }}
      />
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
