import React from 'react'
import { Modal, TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated'
import { theme } from '../../style/style'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUtensils, faCarrot, faPepperHot, faLeaf, faEgg, faStar } from '@fortawesome/free-solid-svg-icons'

import FadeInStatusBar from '../FadeInStatusBar'

// Create a forwarded ref version of FontAwesomeIcon
const ForwardedFontAwesomeIcon = React.forwardRef((props, ref) => (
  <View ref={ref} style={props.style}>
    <FontAwesomeIcon {...props} />
  </View>
))

// Create animated component from the forwarded ref version
const AnimatedFontAwesomeIcon = Animated.createAnimatedComponent(ForwardedFontAwesomeIcon)

const FullScreenImage = ({ visible, imageUrl, onClose, bio }) => {
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

      // Scale in animation
      scale.value = withSpring(1)

      // Animate border width
      borderWidth.value = withSequence(
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

      // Modified floating icons animation
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
        pos.rotation.value = withSequence(
          withRepeat(
            withTiming(360, { duration: 2000 }),
            3, // Three rotations to match the floating duration
            false,
          ),
        )
      })
    } else {
      // Reset all animation values when modal closes
      scale.value = withTiming(0)
      borderWidth.value = withTiming(20)
      plateRotation.value = 0

      // Reset icon positions with centerOffset
      iconPositions.forEach(pos => {
        pos.x.value = -12 // centerOffset
        pos.y.value = -12 // centerOffset
        pos.rotation.value = 0
      })
    }
  }, [visible])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plateRotation.value}deg` }, { scale: scale.value }],
    borderWidth: borderWidth.value,
  }))

  const icons = [faUtensils, faCarrot, faPepperHot, faLeaf, faEgg]

  return (
    <>
      {visible && <FadeInStatusBar />}
      <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
        <TouchableOpacity style={styles.fullScreenOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.fullScreenContent}>
            {/* Decorative floating icons */}
            {iconPositions.map((pos, index) => (
              <AnimatedFontAwesomeIcon
                key={index}
                icon={icons[index]}
                style={[
                  styles.floatingIcon,
                  useAnimatedStyle(() => ({
                    transform: [
                      { translateX: pos.x.value },
                      { translateY: pos.y.value },
                      { rotate: `${pos.rotation.value}deg` },
                    ],
                  })),
                ]}
                color={theme.colors.primary}
                size={24}
              />
            ))}

            {/* Image container */}
            <Animated.View style={[styles.imageContainer, containerStyle]}>
              <Animated.Image source={{ uri: imageUrl }} style={styles.fullScreenImage} resizeMode='cover' />

              {/* Patron badge */}
              <View style={styles.patronBadge}>
                <FontAwesomeIcon icon={faStar} color={theme.colors.primary} size={25} />
                <Text style={styles.patronText}>Patron</Text>
              </View>
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

            {/* QR Code Placeholder */}
            {/* <Animated.View
                            style={[
                                styles.qrContainer,
                                useAnimatedStyle(() => ({
                                    opacity: scale.value,
                                    transform: [{ scale: scale.value }]
                                }))
                            ]}
                        >
                            <View style={styles.qrPlaceholder}>
                                <Text style={styles.qrText}>QR</Text>
                            </View>
                        </Animated.View> */}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
    borderWidth: 200,
    borderColor: theme.colors.primary,
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
    backgroundColor: theme.colors.secondary,
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
  qrContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  qrPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  qrText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.uiBold,
  },
})

export default FullScreenImage
