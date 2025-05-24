import React, { useRef, useEffect } from 'react'
import { Animated, Easing, Text, View, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUserPlus, faCheck, faTimes, faHeart, faComment, faSave, faShare } from '@fortawesome/free-solid-svg-icons'

import { theme } from '../../style/style'
import { Toast } from './Toast'

const ACTION_ICONS = {
  follow: faUserPlus,
  like: faHeart,
  comment: faComment,
  save: faSave,
  share: faShare,
  default: faCheck,
  error: faTimes,
}

export default ActionToast = ({ onPress, onClose, message, visible, actionType = 'default', success = true }) => {
  const iconScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(iconScale, {
        toValue: 1.5,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()

    return () => {
      iconScale.setValue(0)
    }
  }, [])

  const getIcon = () => {
    if (!success) return ACTION_ICONS.error
    return ACTION_ICONS[actionType] || ACTION_ICONS.default
  }

  return (
    <Toast onPress={onPress} onClose={onClose} visible={visible}>
      <View style={styles.iconContainer}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <FontAwesomeIcon icon={getIcon()} size={20} color={success ? theme.colors.primary : theme.colors.error} />
        </Animated.View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Toast>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
  },
})
