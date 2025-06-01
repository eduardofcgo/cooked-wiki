import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

const Bounce = ({
  children,
  trigger = true,
  delay = 1000,
  initialScale = 1,
  bounceScale = 1.5,
  duration = 200,
  friction = 2,
  tension = 45,
  loop = false,
}) => {
  const bounceAnim = useRef(new Animated.Value(initialScale)).current

  useEffect(() => {
    if (trigger) {
      bounceAnim.setValue(initialScale)

      setTimeout(() => {
        const bounceSequence = Animated.sequence([
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
        ])

        if (loop) {
          Animated.loop(bounceSequence).start()
        } else {
          bounceSequence.start()
        }
      }, delay)
    }
  }, [trigger, loop])

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
