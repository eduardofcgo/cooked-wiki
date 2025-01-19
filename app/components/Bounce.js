import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

const Bounce = ({
  children,
  trigger,
  delay = 1000,
  initialScale = 1,
  bounceScale = 1.5,
  duration = 200,
  friction = 2,
  tension = 45,
}) => {
  const bounceAnim = useRef(new Animated.Value(initialScale)).current

  useEffect(() => {
    if (trigger) {
      bounceAnim.setValue(initialScale)

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: bounceScale,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: initialScale,
            friction: friction,
            tension: tension,
            useNativeDriver: true,
          }),
        ]).start()
      }, delay)
    }
  }, [trigger])

  return (
    <Animated.View
      style={{
        transform: [{ scale: bounceAnim }],
      }}
    >
      {children}
    </Animated.View>
  )
}

export default Bounce
