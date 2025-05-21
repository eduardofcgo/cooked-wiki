import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AnimatedBell from '../notification/AnimatedBell'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'
import Bounce from '../core/Bounce'

const NewNotificationsCTA = ({ onPress, hasNewNotifications }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current
  const [bounceTrigger, setBounceTrigger] = useState(0)

  useEffect(() => {
    if (hasNewNotifications) {
      // Start the pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start()

      // Set up periodic bounce only when there are new notifications
      const bounceInterval = setInterval(() => {
        setBounceTrigger(prev => prev + 1)
      }, 5000)

      return () => {
        clearInterval(bounceInterval)
      }
    } else {
      pulseAnim.setValue(0)
      setBounceTrigger(0) // Reset bounce trigger when there are no new notifications
    }
  }, [hasNewNotifications])

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  })

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  })

  return (
    <TouchableOpacity style={styles.container} hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }} onPress={onPress}>
      {hasNewNotifications && (
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      )}
      <Bounce trigger={bounceTrigger} bounceScale={2} duration={150} friction={3}>
        {hasNewNotifications ? <AnimatedBell /> : <Icon name='bell' size={20} color={theme.colors.softBlack} />}
      </Bounce>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    top: -5,
    left: -5,
  },
})

export default observer(NewNotificationsCTA)
