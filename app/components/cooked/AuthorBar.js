import { useNavigation, useNavigationState } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { theme } from '../../style/style'

const Image = FastImage

const formatDate = dateString => {
  if (!dateString) return ''
  return moment(dateString).format('Do MMM YYYY')
}

const formatWeeksAgo = dateString => {
  if (!dateString) return ''
  return moment(dateString).fromNow()
}

const AuthorBar = observer(
  ({ profileImage, username, date, backgroundColor, relativeDate = false, roundedTop = false, children }) => {
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

    const formattedDate = useMemo(() => {
      return relativeDate ? formatWeeksAgo(date) : formatDate(date)
    }, [relativeDate, date])

    return (
      <View
        style={[
          styles.profileHeader,
          { backgroundColor: backgroundColor || theme.colors.secondary },
          roundedTop && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        ]}
      >
        <TouchableOpacity style={styles.profile} onPress={onUserPress} activeOpacity={0.7}>
          <Image source={{ uri: profileImage }} style={styles.profilePicture} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rightButtonsContainer}>{children}</View>
      </View>
    )
  },
)

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
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
  rightButtonsContainer: {
    padding: 8,
  },
})

export default AuthorBar
