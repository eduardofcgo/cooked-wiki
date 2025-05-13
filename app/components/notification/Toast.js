import React, { useEffect, useRef, useState } from 'react'
import { Animated, Text, StyleSheet, TouchableOpacity, View, Easing, PanResponder, Keyboard } from 'react-native'
import { theme } from '../../style/style'

const NOTIFICATION_TOP_OFFSET = 100
const NOTIFICATION_HEIGHT = 80
const ANIMATION_DURATION = 300
const SWIPE_THRESHOLD = 50 // minimum distance to trigger swipe dismiss

export const Toast = ({ onPress, onClose, duration, visible, children }) => {
  const [isVisible, setIsVisible] = useState(visible)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const translateY = useRef(new Animated.Value(NOTIFICATION_HEIGHT)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const isDragging = useRef(false)
  const closeTimer = useRef(null)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardVisible(true)
      setKeyboardHeight(event.endCoordinates.height)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const startCloseTimer = () => {
    if (!duration) return

    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      hideNotification()
    }, duration)
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
        // Allow movement in appropriate direction based on position
        if (isKeyboardVisible) {
          // Allow upward movement when at top (negative dy)
          if (gestureState.dy < 0) {
            translateY.setValue(gestureState.dy)
          }
        } else {
          // Allow downward movement when at bottom (positive dy)
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy)
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false
        // Check for horizontal swipe
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Swipe horizontally to dismiss
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: gestureState.dx > 0 ? 400 : -400,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsVisible(false)
            // Reset opacity for next appearance
            opacity.setValue(0)
            if (onClose) onClose()
          })
        }
        // Check for vertical swipe based on position
        else if (
          (isKeyboardVisible && gestureState.dy < -SWIPE_THRESHOLD) ||
          (!isKeyboardVisible && gestureState.dy > SWIPE_THRESHOLD)
        ) {
          // Swipe to dismiss (up when at top, down when at bottom)
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: isKeyboardVisible ? -NOTIFICATION_HEIGHT * 2 : NOTIFICATION_HEIGHT * 2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsVisible(false)
            // Reset opacity for next appearance
            opacity.setValue(0)
            if (onClose) onClose()
          })
        } else {
          // Return to center if not swiped far enough
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 10,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 10,
            }),
          ]).start(() => {
            // Restart the close timer after the animation completes
            startCloseTimer()
          })
        }
      },
    }),
  ).current

  const showNotification = () => {
    setIsVisible(true)

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 5,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startCloseTimer()
    })
  }

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isKeyboardVisible ? -NOTIFICATION_HEIGHT : NOTIFICATION_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false)
      // Reset opacity for next appearance
      opacity.setValue(0)
      if (onClose) onClose()
    })
  }

  useEffect(() => {
    if (visible) {
      showNotification()
    } else {
      hideNotification()
    }

    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [visible, duration, isKeyboardVisible])

  return (
    <Animated.View
      style={[
        styles.container,
        isKeyboardVisible ? { bottom: NOTIFICATION_TOP_OFFSET + keyboardHeight } : { bottom: NOTIFICATION_TOP_OFFSET },
        {
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => {
          if (onPress) onPress()
          hideNotification()
        }}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    width: 270,
    marginLeft: -135, // Half of the width to center it
    backgroundColor: theme.colors.background,
    borderWidth: 0,
    borderColor: theme.colors.primary,
    height: 70,
    zIndex: 1500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: theme.borderRadius.default,
    marginBottom: 16,
  },
  containerBottom: {},
  containerTop: {
    top: 50,
    marginTop: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 2,
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  chevronContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
