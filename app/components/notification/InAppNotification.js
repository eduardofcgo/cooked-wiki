import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, TouchableOpacity, View, Easing, PanResponder } from 'react-native'
import { theme } from '../../style/style'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

import FadeInStatusBar from '../FadeInStatusBar'

const NOTIFICATION_HEIGHT = 80
const ANIMATION_DURATION = 300

const NOTIFICATION_DURATION = 5000

const SWIPE_THRESHOLD = 50 // minimum distance to trigger swipe dismiss

export const InAppNotification = ({ 
  visible, 
  onPress, 
  onClose, 
  title, 
  message,
  type = 'default' // Can be 'default', 'success', 'error'
}) => {
  const translateY = useRef(new Animated.Value(NOTIFICATION_HEIGHT)).current
  const translateX = useRef(new Animated.Value(0)).current
  const bellRotation = useRef(new Animated.Value(0)).current
  const isDragging = useRef(false)
  const closeTimer = useRef(null)

  const startCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      hideNotification()
    }, NOTIFICATION_DURATION)
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true
        if (closeTimer.current) clearTimeout(closeTimer.current)
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx)
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Swipe to dismiss
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? 400 : -400,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            if (onClose) onClose()
          })
        } else {
          // Return to center if not swiped far enough
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10
          }).start(() => {
            // Restart the close timer after the animation completes
            startCloseTimer()
          })
        }
      }
    })
  ).current

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 5
      }).start()

      const bellAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bellRotation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(bellRotation, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      )
      bellAnimation.start()

      startCloseTimer()

      return () => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        bellAnimation.stop()
      }
    }
  }, [visible])

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: NOTIFICATION_HEIGHT,
      duration: ANIMATION_DURATION,
      useNativeDriver: true
    }).start(() => {
      if (onClose) onClose()
    })
  }

  const rotateInterpolation = bellRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg']
  })

  if (!visible) return null

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [
            { translateY },
            { translateX }
          ] 
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={styles.content} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <MaterialCommunityIcons 
              name="bell" 
              size={24} 
              color={theme.colors.primary}
            />
          </Animated.View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <FontAwesomeIcon 
            icon={faChevronRight} 
            size={14} 
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderWidth: 0,
    borderColor: theme.colors.primary,
    height: NOTIFICATION_HEIGHT,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    marginHorizontal: 16,
    marginBottom: 80,
    borderRadius: theme.borderRadius.default,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    marginBottom: 2,
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  chevronContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// Example usage:
export const showFriendCookedNotification = ({
  friendName,
  recipeName,
  onPress
}) => {
  return {
    title: `${friendName} cooked!`,
    onPress
  }
}

export const showRecipeSavedNotification = ({
  recipeName
}) => {
  return {
    title: 'Recipe Saved',
    message: `${recipeName} has been saved to your cookbook`,
    type: 'success'
  }
}
