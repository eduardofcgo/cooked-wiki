import React, { useRef, useEffect } from 'react'
import { Animated, Easing, Text, View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

import FadeInStatusBar from '../FadeInStatusBar'
import { theme } from '../../style/style'
import { Toast } from './Toast'

const DURATION = 5000

export default InAppNotification = ({ onPress, onClose, children }) => {
  const bellRotation = useRef(new Animated.Value(0)).current

  const rotateInterpolation = bellRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  })

  useEffect(() => {
    const bellAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bellRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bellRotation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )
    bellAnimation.start()

    return () => {
      bellAnimation.stop()
    }
  })

  return (
    <>
      <Toast onPress={onPress} onClose={onClose} duration={DURATION}>
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <MaterialCommunityIcons name='bell' size={24} color={theme.colors.primary} />
          </Animated.View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {children}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <FontAwesomeIcon icon={faChevronRight} size={14} color={theme.colors.primary} />
        </View>
      </Toast>
    </>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 25,
    height: 25,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
  },
  chevronContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
