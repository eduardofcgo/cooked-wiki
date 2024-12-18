import React, { useEffect, useCallback, useState } from 'react'
import Svg, { Path } from 'react-native-svg';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Linking, Platform, Modal } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'
import { observer } from 'mobx-react-lite'
import { useFocusEffect } from '@react-navigation/native'

import { useStore } from '../context/store/StoreContext'
import { requestPushNotificationsPermission } from '../notifications/push'
import { theme } from '../style/style'
import { Button, PrimaryButton } from '../components/Button'
import Loading from '../components/Loading'
import CookedWebView from '../components/CookedWebView'
import { getCommunityJournalUrl } from '../urls'

const HandDrawnArrow = () => (
<Svg width="120px" height="120px" viewBox="-50 0 175 175" fill="none" xmlns="http://www.w3.org/2000/svg">
  <Path
      d="M20.1871 175C15.7485 172.891 13.0008 172.469 12.1553 170.992C8.98489 165.508 5.39173 160.024 3.70083 153.908C-1.37187 137.666 -0.737781 121.214 2.64402 104.762C8.35081 76.7092 21.0325 51.8201 36.8847 28.1966C38.5756 25.6655 40.0552 23.1344 41.7461 20.3924C41.7461 20.1814 41.5347 19.7596 41.112 19.1268C36.462 20.3923 31.6007 21.6579 26.9507 22.7125C24.4144 23.1344 21.4552 23.1344 18.9189 22.2907C17.4394 21.8688 15.3258 19.5486 15.3258 18.0722C15.3258 16.1739 16.8053 13.8537 18.0735 12.1663C19.1303 11.1117 21.0326 10.9008 22.7235 10.4789C35.4052 7.31508 48.087 3.72935 60.9801 0.776411C71.9709 -1.75468 75.564 1.83105 74.9299 12.5882C74.2959 23.7672 74.0845 34.9462 73.6618 45.9142C73.4505 49.289 72.8164 52.8747 72.3936 56.6714C63.5164 52.6638 63.5164 52.6638 60.346 18.494C47.0301 33.2588 38.1529 49.289 29.9098 65.7411C21.6666 82.1932 16.1712 99.489 13.2121 117.839C10.2531 136.823 13.8462 154.751 20.1871 175Z" 
      fill={theme.colors.primary} />
</Svg>
);

export default Community = observer(({ navigation, route }) => {
  const { userStore, profileStore } = useStore()
  const notificationPermissionStatus = userStore.notificationPermissionStatus
  const contactsPermissionStatus = userStore.contactsPermissionStatus

  const { hiddenNotificationsCard, hiddenFindFriendsCard } = userStore
  const { followingUsernames } = profileStore

  const [isLoading, setIsLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        await profileStore.loadFollowing()
      } catch (e) {
        // TODO: user should know there was an error
        console.error(e)
      } finally {
        setIsLoading(false)
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

  const showNotificationsCard = notificationPermissionStatus !== 'granted' && userStore.enabledNotifications && !hiddenNotificationsCard
  const showFindFriendsCard = !hiddenFindFriendsCard

  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(1.05, { duration: 500 }),
            withTiming(1, { duration: 1000 })
          ),
          -1
        ) },
      ]
    };
  });

  return (
    <View style={styles.container}>
      {showNotificationsCard || showFindFriendsCard && (
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
                    <Icon name="close" size={20} color={theme.colors.primary} />
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
                    <Icon name="close" size={20} color={theme.colors.primary} />
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
      )}

      {isLoading ? (
        <View style={styles.emptyStateContainer}>
          <Loading />
        </View>
      ) : (
        followingUsernames.size === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Not following anyone.</Text>
            <Text style={styles.emptySearchText}>Follow your friends to see what they're cooking.</Text>
          </View>
        ) : (
          <CookedWebView 
            startUrl={getCommunityJournalUrl()} 
            navigation={navigation} 
            route={route} 
          />
        )
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <Reanimated.View style={[pulseAnim]}>
            <View style={styles.clearCircle}>
              <Icon name="account-multiple" size={20} color={theme.colors.softBlack} />
            </View>
          </Reanimated.View>
            
          <View style={[styles.arrowContainer]}>
            <HandDrawnArrow />
          </View>
          
          <View style={styles.modalTouchable}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                You can always tap the icon at the top right corner to find friends.
              </Text>
              <View>
                <Button
                  title="Got it" 
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
})
