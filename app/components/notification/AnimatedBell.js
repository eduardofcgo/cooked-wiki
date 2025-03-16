import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { theme } from '../../style/style'

const AnimatedBell = props => {
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
  }, [])

  return (
    <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
      <Icon name='bell' size={20} color={theme.colors.primary} {...props} />
    </Animated.View>
  )
}

export default AnimatedBell
