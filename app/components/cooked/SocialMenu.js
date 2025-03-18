import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { useCallback } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'

const formatDate = dateString => {
  if (!dateString) return ''
  return moment(dateString).format('Do MMM YYYY')
}

const formatWeeksAgo = dateString => {
  if (!dateString) return ''
  return moment(dateString).fromNow()
}

const SocialMenuIcons = ({ onHeartPress, onSharePress, likeCount = 0 }) => {
  return (
    <View style={styles.iconWrapper}>
      <View style={styles.heartContainer}>
        {likeCount > 0 && <Text style={styles.likeCounter}>{likeCount}</Text>}
        <TouchableOpacity onPress={onHeartPress} style={styles.iconContainer}>
          <FontAwesome name='heart' size={18} color={`${theme.colors.primary}80`} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onSharePress} style={styles.iconContainer}>
        <FontAwesome name='paper-plane' size={18} color={`${theme.colors.primary}80`} />
      </TouchableOpacity>
    </View>
  )
}

const SocialMenu = ({
  onActionPress,
  profileImage,
  username,
  date,
  showExpandIcon,
  onHeartPress,
  relativeDate = false,
  likeCount = 0,
}) => {
  const navigation = useNavigation()

  const onUserPress = useCallback(() => {
    navigation.navigate('PublicProfile', { username })
  }, [navigation, username])

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
            <SocialMenuIcons onHeartPress={onHeartPress} likeCount={12} />
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
