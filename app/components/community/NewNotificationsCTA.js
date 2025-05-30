import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated, View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AnimatedBell from '../notification/AnimatedBell'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'
import Bounce from '../core/Bounce'
import { useStore } from '../../context/StoreContext'

const NewNotificationsCTA = ({ onPress, hasNewNotifications }) => {
  const { notificationsStore } = useStore()
  const pulseAnim = useRef(new Animated.Value(0)).current
  const [bounceTrigger, setBounceTrigger] = useState(0)

  const { notificationsUnreadCount } = notificationsStore

  useEffect(() => {
    if (hasNewNotifications) {
      // Start with a smooth fade-in, then begin the pulse loop
      Animated.sequence([
        // Smooth transition to start the pulse
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        // Then start the pulse loop
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
        ),
      ]).start()

      // Set up periodic bounce only when there are new notifications
      const bounceInterval = setInterval(() => {
        setBounceTrigger(prev => prev + 1)
      }, 5000)

      return () => {
        clearInterval(bounceInterval)
      }
    } else {
      // Smooth fade-out instead of abrupt setValue
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
      setBounceTrigger(0) // Reset bounce trigger when there are no new notifications
    }
  }, [hasNewNotifications])

  const scale = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1.3],
  })

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
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
      {notificationsUnreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationsUnreadCount > 99 ? '99+' : notificationsUnreadCount}</Text>
        </View>
      )}
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
  badge: {
    position: 'absolute',
    top: -20,
    left: 25,
    transform: [{ translateX: -12 }],
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: theme.fonts.uiBold,
    textAlign: 'center',
  },
})

export default observer(NewNotificationsCTA)
