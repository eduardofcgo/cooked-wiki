import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox'
import { faBookmark } from '@fortawesome/free-solid-svg-icons/faBookmark'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons/faCartShopping'
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { IconButton, Menu } from 'react-native-paper'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'
import { Linking } from 'react-native'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { FontAwesome } from '@expo/vector-icons'
import { useInAppNotification } from '../context/NotificationContext'
import { useStore } from '../context/StoreContext'
import { theme, titleStyle } from '../style/style'

import { Button, SecondaryButton } from '../components/core/Button'
import ActionToast from '../components/notification/ActionToast'
import CookedFeed from '../components/profile/CookedFeed'
import EditBio from '../components/profile/EditBio'
import FullScreenProfilePicture from '../components/profile/FullScreenProfilePicture'
import { useAuth } from '../context/AuthContext'
import { getShareableProfileUrl } from '../urls'
import Recipes from './webviews/Recipes'
import ShoppingList from './webviews/ShoppingList'
import PhotoSelectionModal from '../components/PhotoSelectionModal'
import * as ImagePicker from 'expo-image-picker'

const Image = FastImage

const Tab = createMaterialTopTabNavigator()

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const tabLabelTextStyle = {
  color: theme.colors.softBlack,
  fontFamily: theme.fonts.ui,
  fontSize: theme.fontSizes.default,
}

const TabBarLabel = ({ icon, label, focused }) => (
  <View style={tabBarLabelStyle}>
    <FontAwesomeIcon icon={icon} color={focused ? theme.colors.black : theme.colors.softBlack} />
    <Text
      allowFontScaling={false}
      style={{
        ...tabLabelTextStyle,
        color: focused ? theme.colors.black : theme.colors.softBlack,
      }}
    >
      {label}
    </Text>
  </View>
)

const ProfileMenu = observer(({ navigation, onEditBio, username, isUploading, setIsUploading }) => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [photoSelectionModalVisible, setPhotoSelectionModalVisible] = useState(false)
  const { profileStore } = useStore()
  const { showInAppNotification } = useInAppNotification()

  const handleCameraPress = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setPhotoSelectionModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        // In production build, the fileName is null
        name: result.assets[0].fileName || result.assets[0].uri.split('/').pop(),
        type: result.assets[0].mimeType,
      }

      try {
        await profileStore.updateProfileImage(username, file)
        showInAppNotification(ActionToast, {
          props: { message: 'Profile photo updated' },
          resetQueue: true,
        })
      } catch (error) {
        console.error('Error updating profile photo:', error)
        Alert.alert('Error', 'Failed to update profile photo. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleGalleryPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setPhotoSelectionModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        // In production build, the fileName is null
        name: result.assets[0].fileName || result.assets[0].uri.split('/').pop(),
        type: result.assets[0].mimeType,
      }

      try {
        await profileStore.updateProfileImage(username, file)
        showInAppNotification(ActionToast, {
          props: { message: 'Profile photo updated' },
          resetQueue: true,
        })
      } catch (error) {
        console.error('Error updating profile photo:', error)
        Alert.alert('Error', 'Failed to update profile photo. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon='dots-vertical'
            iconColor={theme.colors.softBlack}
            size={23}
            onPress={() => setMenuVisible(true)}
          />
        }
        anchorPosition='bottom'
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false)
            navigation.navigate('Settings')
          }}
          title='Share'
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false)
            navigation.navigate('Settings')
          }}
          title='Settings'
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false)
            onEditBio()
          }}
          title='Update bio'
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false)
            setPhotoSelectionModalVisible(true)
          }}
          title='Update photo'
        />
        {/* <Menu.Item
          onPress={() => {
            setMenuVisible(false)
            Linking.openURL('https://cooked.wiki/contact')
          }}
          title='Help'
        /> */}
      </Menu>
      <PhotoSelectionModal
        visible={photoSelectionModalVisible}
        onClose={() => setPhotoSelectionModalVisible(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    </>
  )
})

const ProfileHeader = observer(({ username, navigation, menu, isUploading }) => {
  const showImage = true
  const [isImageFullScreen, setIsImageFullScreen] = useState(false)

  const { profileStore } = useStore()
  const bio = profileStore.getBio(username)
  const isPatron = profileStore.isPatron(username)
  const profileImageThumbnail = profileStore.getProfileImageUrl(username)

  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        {showImage ? (
          <>
            <TouchableOpacity onPress={() => setIsImageFullScreen(true)}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: profileImageThumbnail,
                  }}
                  style={[styles.profileImage, false && styles.patronImage]}
                />
                {/* {isPatron && (
                  <View style={styles.patronBadge}>
                    <FontAwesomeIcon icon={faStar} color={theme.colors.primary} size={12} />
                  </View>
                )} */}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size='small' color={theme.colors.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <FullScreenProfilePicture
              visible={isImageFullScreen}
              imageUrl={profileImageThumbnail}
              onClose={() => setIsImageFullScreen(false)}
              bio={bio}
              isPatron={false}
            // isPatron={isPatron}
            />
          </>
        ) : (
          <Icon name='account' size={64} color={theme.colors.softBlack} style={styles.avatarPlaceholder} />
        )}
        <View style={styles.profileText}>
          <Text maxFontSizeMultiplier={2} style={styles.username}>
            {username}
          </Text>
          <Text style={styles.bio}>{bio}</Text>
        </View>
      </View>

      {menu}
    </View>
  )
})

const Profile = observer(({ route, navigation, username, publicView }) => {
  const [editBioVisible, setEditBioVisible] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Use both a shared value (for animations) and state (for UI updates)
  const scrollY = useSharedValue(0)

  // Function to update the navigation header title (runs on JS thread)
  const updateHeaderTitle = useCallback(
    showTitle => {
      navigation.setOptions({
        headerTitle: showTitle ? username : 'Profile',
      })
    },
    [navigation, username],
  )

  // Create animated style for header
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const headerTranslateY = interpolate(scrollY.value, [0, 200], [0, -64], { extrapolateRight: 'clamp' })
    const headerOpacity = interpolate(scrollY.value, [0, 100], [1, 0], { extrapolateRight: 'clamp' })

    return {
      transform: [{ translateY: headerTranslateY }],
      opacity: headerOpacity,
    }
  })

  // Add animated style for the content below header
  const animatedContentStyle = useAnimatedStyle(() => {
    const contentTranslateY = interpolate(scrollY.value, [0, 200], [0, -64], { extrapolateRight: 'clamp' })

    return {
      transform: [{ translateY: contentTranslateY }],
    }
  })

  // Update navigation header title based on scroll position
  useAnimatedReaction(
    () => {
      return interpolate(scrollY.value, [0, 100], [0, 1], { extrapolateRight: 'clamp' })
    },
    headerTitleOpacity => {
      const showTitle = headerTitleOpacity > 0.5
      runOnJS(updateHeaderTitle)(showTitle)
    },
  )

  const handleScroll = event => {
    const yOffset = event.nativeEvent.contentOffset.y

    scrollY.value = yOffset
  }

  return (
    <>
      <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
        <ProfileHeader
          username={username}
          navigation={navigation}
          isUploading={isUploading}
          menu={
            !publicView ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    Share.share({
                      message: `Check out my profile on Cooked.wiki!`,
                      url: getShareableProfileUrl(username),
                    })
                  }}
                >
                  <FontAwesome name='paper-plane' size={16} color={theme.colors.softBlack} />
                </TouchableOpacity>
                <ProfileMenu
                  navigation={navigation}
                  onEditBio={() => setEditBioVisible(true)}
                  username={username}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              </>
            ) : (
              <TouchableOpacity
                style={{ padding: 16 }}
                onPress={() => {
                  Share.share({
                    message: `Check out ${username}'s profile on Cooked.wiki!`,
                    url: getShareableProfileUrl(username),
                  })
                }}
              >
                <FontAwesome name='paper-plane' size={16} color={theme.colors.softBlack} />
              </TouchableOpacity>
            )
          }
        />
      </Animated.View>
      <EditBio visible={editBioVisible} onClose={() => setEditBioVisible(false)} />
      <Animated.View style={[animatedContentStyle, styles.content]}>
        <Tab.Navigator
          screenOptions={{
            ...tabStyle,

            // If its the user's own profile, we want to eargerly load all the tabs,
            // since most likely the user will visit them soon.
            lazy: !publicView,
          }}
        >
          <Tab.Screen
            name='CookedFeed'
            options={{
              tabBarLabel: ({ focused }) => <TabBarLabel icon={faBook} label='Cooked' focused={focused} />,
            }}
          >
            {() => <CookedFeed username={username} navigation={navigation} route={route} onScroll={handleScroll} />}
          </Tab.Screen>
          <Tab.Screen
            name='Recipes'
            options={{
              tabBarLabel: ({ focused }) => <TabBarLabel icon={faBookmark} label='Recipes' focused={focused} />,
            }}
          >
            {() => <Recipes username={username} navigation={navigation} route={route} />}
          </Tab.Screen>
          <Tab.Screen
            name='Shopping'
            options={{
              tabBarLabel: ({ focused }) => <TabBarLabel icon={faCartShopping} label='Shopping' focused={focused} />,
            }}
          >
            {() => <ShoppingList username={username} navigation={navigation} route={route} />}
          </Tab.Screen>
        </Tab.Navigator>
      </Animated.View>
    </>
  )
})

const FollowButton = observer(({ username }) => {
  const { profileStore } = useStore()
  const { showInAppNotification } = useInAppNotification()
  const [isLoading, setIsLoading] = useState(false)

  const isFollowing = profileStore.isFollowing(username)

  const handleFollowPress = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await profileStore.follow(username)
      showInAppNotification(ActionToast, {
        props: { message: 'Followed this user' },
        resetQueue: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [username, isLoading])

  const handleUnfollowPress = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await profileStore.unfollow(username)
      showInAppNotification(ActionToast, {
        props: { message: 'Unfollowed this user' },
        resetQueue: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [username, isLoading])

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isLoading && <ActivityIndicator size='small' color={theme.colors.primary} style={{ marginRight: 5 }} />}
      {isFollowing ? (
        <SecondaryButton title='Following' onPress={handleUnfollowPress} loading={isLoading} style={{ width: 105 }} />
      ) : (
        <Button title='Follow' onPress={handleFollowPress} loading={isLoading} style={{ width: 105 }} />
      )}
    </View>
  )
})

export const PublicProfile = observer(({ route, navigation }) => {
  const { credentials } = useAuth()

  const username = route.params.username

  // User can navigate to his own profile from other screens
  const showingOwnProfileAsPublic = credentials.username === username

  useLayoutEffect(() => {
    if (!showingOwnProfileAsPublic) {
      navigation.setOptions({
        headerRight: () => <FollowButton username={username} />,
      })
    }
  }, [navigation, showingOwnProfileAsPublic])

  return (
    <View style={{ ...styles.container, paddingTop: 0 }}>
      <Profile route={route} navigation={navigation} username={username} publicView={true} />
    </View>
  )
})

export const LoggedInProfile = observer(({ route, navigation }) => {
  const { credentials } = useAuth()

  if (!credentials) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <Profile route={route} navigation={navigation} username={credentials.username} publicView={false} />
    </SafeAreaView>
  )
})

const tabBarLabelStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
}

const tabStyle = {
  tabBarActiveTintColor: theme.colors.secondary,
  tabBarInactiveTintColor: theme.colors.secondary,
  tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
  tabBarStyle: {
    backgroundColor: theme.colors.secondary,
  },
  swipeEnabled: true,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  headerContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    height: 72,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    minHeight: SCREEN_HEIGHT + 64,
    backgroundColor: theme.colors.secondary,
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    paddingRight: 5,
    backgroundColor: theme.colors.white,
  },
  patronImage: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  username: {
    ...titleStyle,
  },
  bio: {
    flex: 1,
    flexWrap: 'wrap',
    overflow: 'hidden',
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    paddingRight: 5,
  },
  patronBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 5,
    borderRadius: 20,
    position: 'absolute',
    top: -5,
    left: 55,
    transform: [{ translateX: -12 }],
    zIndex: 10,
    gap: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  patronText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.extraSmall,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
})
