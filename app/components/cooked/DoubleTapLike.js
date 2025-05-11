import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

const DoubleTapLike = ({ onDoubleTap, children, style }) => {
  const [lastTap, setLastTap] = useState(null)
  const heartOpacity = useRef(new Animated.Value(0)).current
  const heartScale = useRef(new Animated.Value(0)).current
  const tapTimeout = useRef(null)

  // Function to handle tap events
  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 500 // increased from 300ms to reduce accidental triggers
    const SINGLE_TAP_TIMEOUT = 700 // time to wait before resetting a single tap

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      clearTimeout(tapTimeout.current)
      onDoubleTap()
      animateHeart()
      setLastTap(null) // Reset to avoid triple-tap
    } else {
      // Single tap - we'll wait to see if it becomes a double tap
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current)
      }

      setLastTap(now)

      // Clear the lastTap state if no second tap occurs within timeout
      tapTimeout.current = setTimeout(() => {
        setLastTap(null)
      }, SINGLE_TAP_TIMEOUT)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current)
      }
    }
  }, [])

  // Animation for heart icon
  const animateHeart = () => {
    // Reset animation values
    heartOpacity.setValue(0)
    heartScale.setValue(0)

    // Animate heart appearing and growing
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Then fade out
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, style]}>
        {children}
        <Animated.View
          style={[
            styles.heartContainer,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <FontAwesome name='heart' size={80} color={'#d87192'} />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
})

export default DoubleTapLike
