import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useNavigationState } from '@react-navigation/native'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'

const formatDate = dateString => {
  if (!dateString) return ''
  return moment(dateString).format('Do MMM YYYY')
}

const formatWeeksAgo = dateString => {
  if (!dateString) return ''
  return moment(dateString).fromNow()
}

const SocialMenuIcons = observer(({ cookedId, onSharePress }) => {
  const navigation = useNavigation()

  const { profileStore } = useStore()

  const stats = profileStore.cookedStats.get(cookedId)
  const likeCount = stats?.['like-count']
  const liked = stats?.liked

  const likeCooked = useCallback(() => {
    profileStore.likeCooked(cookedId)
  }, [cookedId, profileStore])

  const unlikeCooked = useCallback(() => {
    profileStore.unlikeCooked(cookedId)
  }, [cookedId, profileStore])

  const onPressLikeCount = useCallback(() => {
    navigation.navigate('CookedLikes', { cookedId })
  }, [cookedId, navigation])

  useEffect(() => {
    profileStore.loadCookedStats(cookedId)
  }, [cookedId, profileStore])

  return (
    <View style={styles.iconWrapper}>
      {stats ? (
        <View style={styles.heartContainer}>
          {likeCount > 0 && (
            <TouchableOpacity 
              onPress={onPressLikeCount}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 10}}>
                <Text style={styles.likeCounter}>{likeCount}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={liked ? unlikeCooked : likeCooked} style={styles.iconContainer}>
            {liked ? (
              <FontAwesome name='heart' size={18} color={'#d87192'} />
            ) : (
              <FontAwesome name='heart' size={18} color={`${theme.colors.primary}80`} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ActivityIndicator size='small' color={theme.colors.primary} />
      )}

      <TouchableOpacity onPress={onSharePress} style={styles.iconContainer}>
        <FontAwesome name='paper-plane' size={18} color={`${theme.colors.primary}80`} />
      </TouchableOpacity>
    </View>
  )
})

const SocialMenu = ({
  cookedId,
  onActionPress,
  profileImage,
  username,
  date,
  showExpandIcon,
  relativeDate = false,
}) => {
  const navigation = useNavigation()
  const navState = useNavigationState(state => state)

  const onUserPress = useCallback(() => {
    // Check if the PublicProfile screen with this username is in navigation history
    const routes = navState.routes || []
    let targetRouteIndex = -1

    for (let i = 0; i < routes.length; i++) {
      if (routes[i].name === 'PublicProfile' && routes[i].params?.username === username) {
        targetRouteIndex = i
        break
      }
    }

    if (targetRouteIndex >= 0) {
      // The screen exists in history, go back to it
      const backCount = routes.length - 1 - targetRouteIndex
      if (backCount > 0) {
        navigation.pop(backCount)
      }
    } else {
      // Screen not in history, navigate normally
      navigation.navigate('PublicProfile', { username })
    }
  }, [navigation, username, navState])

  return (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.profile} onPress={onUserPress} activeOpacity={0.7}>
        <Image source={{ uri: profileImage }} style={styles.profilePicture} />
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.date}>{relativeDate ? formatWeeksAgo(date) : formatDate(date)}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.expandButtonContainer} onPress={onActionPress}>
        <View style={styles.expandButtonWrapper}>
          {showExpandIcon ? (
            <View style={styles.iconContainer}>
              <MaterialIcons name='keyboard-arrow-up' size={25} color={theme.colors.primary} />
            </View>
          ) : (
            <SocialMenuIcons cookedId={cookedId} onSharePress={undefined} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: theme.colors.secondary,
  },
  profile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: theme.colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.ui,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  iconWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  expandButtonContainer: {
    padding: 8,
  },
  expandButtonWrapper: {},
  iconContainer: {
    alignItems: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
})

export default observer(SocialMenu)
