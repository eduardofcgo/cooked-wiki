import { MaterialCommunityIcons } from '@expo/vector-icons'
import { faCarrot, faEgg, faLeaf, faPepperHot, faUtensils, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '../../style/style'
import FastImage from 'react-native-fast-image'
import { observer } from 'mobx-react-lite'

// Create a forwarded ref version of FontAwesomeIcon
const ForwardedFontAwesomeIcon = React.forwardRef((props, ref) => (
  <View ref={ref} style={props.style}>
    <FontAwesomeIcon {...props} />
  </View>
))

// Create animated component from the forwarded ref version
const AnimatedFontAwesomeIcon = Animated.createAnimatedComponent(ForwardedFontAwesomeIcon)

const FullScreenProfilePicture = ({ visible, imageUrl, onClose, bio, isPatron }) => {
  const plateRotation = useSharedValue(0)
  const scale = useSharedValue(0)
  const borderWidth = useSharedValue(20)
  const iconPositions = Array(5)
    .fill(0)
    .map(() => ({
      x: useSharedValue(0),
      y: useSharedValue(0),
      rotation: useSharedValue(0),
    }))

  React.useEffect(() => {
    if (visible) {
      // Scale in animation (common for both)
      scale.value = withSpring(1)

      if (isPatron) {
        // Patron-specific animations
        // Single bounce plate rotation
        plateRotation.value = withSequence(
          withSpring(15, {
            damping: 4,
            stiffness: 40,
            mass: 1,
            velocity: 12,
          }),
          withSpring(0, {
            damping: 5,
            stiffness: 35,
            mass: 1,
            velocity: 1,
          }),
        )

        // Animate border width for patrons
        borderWidth.value = withSequence(
          withTiming(20, { duration: 0 }), // Ensure starts at 20 immediately
          withTiming(2, {
            duration: 1000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          // After icons float 3 times (6000ms) + small delay, animate border to 0
          withDelay(
            4500,
            withTiming(0, {
              duration: 800,
              easing: Easing.bezier(0.4, 0, 1, 1),
            }),
          ),
        )

        // Modified floating icons animation for patrons
        iconPositions.forEach((pos, index) => {
          const radius = 180
          const angle = (index * 2 * Math.PI) / 5
          const centerOffset = 0 // Half of the icon size (24/2) to center the icons

          pos.x.value = withSequence(
            withRepeat(
              withSequence(
                withTiming(radius * Math.cos(angle) + centerOffset, { duration: 1000 }),
                withTiming(radius * 0.8 * Math.cos(angle) + centerOffset, { duration: 1000 }),
              ),
              3,
              true,
            ),
            withTiming(radius * 3 * Math.cos(angle) + centerOffset, {
              duration: 800,
              easing: Easing.bezier(0.4, 0, 1, 1),
            }),
          )

          pos.y.value = withSequence(
            withRepeat(
              withSequence(
                withTiming(radius * Math.sin(angle) + centerOffset, { duration: 1000 }),
                withTiming(radius * 0.8 * Math.sin(angle) + centerOffset, { duration: 1000 }),
              ),
              3,
              true,
            ),
            withTiming(radius * 3 * Math.sin(angle) + centerOffset, {
              duration: 800,
              easing: Easing.bezier(0.4, 0, 1, 1),
            }),
          )

          // Extended rotation animation
          pos.rotation.value = withSequence(withRepeat(withTiming(360, { duration: 2000 }), 3, false))
        })
      } else {
        // Not a patron: Reset animations immediately
        plateRotation.value = 0
        borderWidth.value = 0

        // Reset icon positions
        iconPositions.forEach(pos => {
          pos.x.value = -12 // centerOffset
          pos.y.value = -12 // centerOffset
          pos.rotation.value = 0
        })
      }
    } else {
      // Reset all animation values when modal closes
      scale.value = withTiming(0)
      borderWidth.value = 0 // Reset to 0
      plateRotation.value = 0

      // Reset icon positions with centerOffset
      iconPositions.forEach(pos => {
        pos.x.value = -12 // centerOffset
        pos.y.value = -12 // centerOffset
        pos.rotation.value = 0
      })
    }
  }, [visible, isPatron]) // Added isPatron dependency

  const containerStyle = useAnimatedStyle(() => {
    // Base transform style applied regardless of patron status
    const baseStyle = {
      transform: [{ rotate: `${plateRotation.value}deg` }, { scale: scale.value }],
    }

    // Conditional styles for patrons
    const patronStyles = isPatron
      ? {
          borderWidth: borderWidth.value,
          borderColor: theme.colors.primary,
          elevation: 10,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
        }
      : {
          // Explicitly set non-patron styles to avoid inheriting from StyleSheet
          borderWidth: 0,
          borderColor: 'transparent', // Ensure no border color shows
          elevation: 0,
          shadowOpacity: 0, // Ensure no shadow
        }

    return {
      ...baseStyle,
      ...patronStyles,
    }
  })

  const icons = [faUtensils, faCarrot, faPepperHot, faLeaf, faEgg]

  // Define animated styles for icons unconditionally
  const iconAnimatedStyles = iconPositions.map(pos => {
    return useAnimatedStyle(() => ({
      transform: [{ translateX: pos.x.value }, { translateY: pos.y.value }, { rotate: `${pos.rotation.value}deg` }],
    }))
  })

  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
      <TouchableOpacity style={styles.fullScreenOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.fullScreenContent}>
          {/* Decorative floating icons - only show if patron */}
          {isPatron &&
            iconPositions.map((pos, index) => (
              <AnimatedFontAwesomeIcon
                key={index}
                icon={icons[index]}
                style={[
                  styles.floatingIcon,
                  iconAnimatedStyles[index], // Use pre-defined animated style
                ]}
                color={theme.colors.primary}
                size={24}
              />
            ))}

          <Animated.View style={[styles.imageContainer, containerStyle]}>
            <FastImage
              source={{ uri: imageUrl }}
              style={styles.fullScreenImage}
              resizeMode={FastImage.resizeMode.cover}
            />

            {isPatron && (
              <View style={styles.patronBadge}>
                <FontAwesomeIcon icon={faStar} color={theme.colors.primary} size={25} />
                <Text style={styles.patronText}>Patron</Text>
              </View>
            )}
          </Animated.View>

          <Animated.Text
            style={[
              styles.fullScreenBio,
              useAnimatedStyle(() => ({
                opacity: scale.value,
                transform: [{ scale: scale.value }],
              })),
            ]}
          >
            {bio || 'No bio yet.'}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    alignItems: 'center',
    position: 'relative',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
  },
  imageContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
  },
  fullScreenBio: {
    color: 'white',
    textAlign: 'center',
    fontSize: theme.fontSizes.default,
    paddingHorizontal: 20,
    maxWidth: 300,
    marginTop: 24,
    fontFamily: theme.fonts.ui,
  },
  floatingIcon: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  patronBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    top: -20,
    zIndex: 10,
    gap: 6,
    elevation: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  patronText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.small,
  },
})

export default observer(FullScreenProfilePicture)
