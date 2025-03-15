import { MaterialIcons } from '@expo/vector-icons'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Recipe from '../screens/webviews/Recipe'
import { theme } from '../style/style'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50
const SNAP_POINTS = {
  COLLAPSED: -80,
  MID: -SCREEN_HEIGHT * 0.7,
  EXPANDED: -SCREEN_HEIGHT + 50,
}

const Cooked = ({ navigation, route }) => {
  // Animation values
  const translateY = useSharedValue(SNAP_POINTS.COLLAPSED)
  const context = useSharedValue({ y: 0 })
  const scrollEnabled = useSharedValue(false)

  // Generate animation styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  const notesContainerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
      ['auto', 0],
      Extrapolate.CLAMP
    )

    return {
      height,
      overflow: 'hidden',
    }
  })

  const photoContainerAnimatedStyle = useAnimatedStyle(() => {
    // Adjust the height of the photo container based on the card position
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID],
      [2, SCREEN_WIDTH * 0.8], // Smaller height when collapsed
      Extrapolate.CLAMP
    )

    return {
      height,
    }
  })

  const imageAnimatedStyle = useAnimatedStyle(() => {
    let borderRadius

    // interpolate supports more than two values / branches?
    if (translateY.value >= SNAP_POINTS.MID) {
      borderRadius = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [0, 20], Extrapolate.CLAMP)
    } else {
      borderRadius = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.EXPANDED], [20, 0], Extrapolate.CLAMP)
    }

    return {
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    }
  })

  const dragIndicatorAnimatedStyle = useAnimatedStyle(() => {
    // Transform the drag indicator into a border when collapsed
    const width = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID],
      [SCREEN_WIDTH, 40],
      Extrapolate.CLAMP
    )

    const top = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [0, 10], Extrapolate.CLAMP)

    const height = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [2, 5], Extrapolate.CLAMP)

    const opacity = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.EXPANDED], [1, 0], Extrapolate.CLAMP)

    return {
      top,
      width,
      height,
      backgroundColor: theme.colors.primary,
      opacity,
    }
  })

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    let opacity

    // Use conditional branches like the border radius implementation
    if (translateY.value >= SNAP_POINTS.MID) {
      opacity = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [0, 0.75], Extrapolate.CLAMP)
    } else {
      opacity = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.EXPANDED], [0.75, 1], Extrapolate.CLAMP)
    }

    return {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    }
  })

  const expandButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SNAP_POINTS.MID - 10, SNAP_POINTS.MID + 10],
      [0, 1],
      Extrapolate.CLAMP
    )

    return {
      opacity: translateY.value <= SNAP_POINTS.MID ? 1 - opacity : opacity,
    }
  })

  const expandButtonIconAnimatedStyle = useAnimatedStyle(() => {
    let rotation

    if (translateY.value <= SNAP_POINTS.MID) {
      // When between expanded and mid-point
      rotation = interpolate(
        translateY.value,
        [SNAP_POINTS.EXPANDED, SNAP_POINTS.MID],
        [180, 180], // Always pointing down
        Extrapolate.CLAMP
      )
    } else {
      // When between mid-point and collapsed
      rotation = interpolate(
        translateY.value,
        [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
        [180, 0], // Transition from down to up
        Extrapolate.CLAMP
      )
    }

    return {
      transform: [{ rotate: `${rotation}deg` }],
    }
  })

  const expandButtonTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateY.value <= SNAP_POINTS.MID ? 1 : 0,
      position: 'absolute',
      left: 0,
      right: 0,
    }
  })

  const collapseButtonTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateY.value <= SNAP_POINTS.MID ? 0 : 1,
    }
  })

  // Function to snap to a specific position
  const snapTo = point => {
    'worklet'
    translateY.value = withSpring(point, { damping: 20, stiffness: 90 })
    scrollEnabled.value = point === SNAP_POINTS.EXPANDED
  }

  // Toggle between expanded and collapsed states
  const toggleExpansion = () => {
    // Get the current position
    const currentPosition = translateY.value

    if (currentPosition <= SNAP_POINTS.MID) {
      // If expanded or at mid-point, first go to MID then to COLLAPSED
      if (currentPosition !== SNAP_POINTS.MID) {
        snapTo(SNAP_POINTS.MID)
        // After a short delay, move to COLLAPSED
        setTimeout(() => {
          snapTo(SNAP_POINTS.COLLAPSED)
        }, 100)
      } else {
        // Already at MID, just go to COLLAPSED
        snapTo(SNAP_POINTS.COLLAPSED)
      }
    } else {
      // If collapsed, first go to MID then to EXPANDED
      if (currentPosition !== SNAP_POINTS.MID) {
        snapTo(SNAP_POINTS.MID)
        // After a short delay, move to EXPANDED
        setTimeout(() => {
          snapTo(SNAP_POINTS.EXPANDED)
        }, 100)
      } else {
        // Already at MID, just go to EXPANDED
        snapTo(SNAP_POINTS.EXPANDED)
      }
    }
  }

  // Setup pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate(event => {
      // Limit drag to prevent going further than max positions
      let newY = event.translationY + context.value.y
      // if (newY > 0) {
      //   newY = 0
      // }
      // else if (newY < MAX_TRANSLATE_Y) {
      //   newY = MAX_TRANSLATE_Y
      // }
      translateY.value = newY
    })
    .onEnd(event => {
      // Determine current position (which snap point we're closest to)
      const currentPosition = translateY.value

      // Handle snapping based on current position and velocity direction
      if (currentPosition > SNAP_POINTS.MID + 50) {
        // We're closer to COLLAPSED
        if (event.velocityY < -20) {
          // Dragging up from near collapsed - go to MID
          snapTo(SNAP_POINTS.MID)
        } else {
          // Dragging down or neutral - stay COLLAPSED
          snapTo(SNAP_POINTS.COLLAPSED)
        }
      } else if (currentPosition < SNAP_POINTS.MID - 50) {
        // We're closer to EXPANDED
        if (event.velocityY > 20) {
          // Dragging down from near expanded - go to MID
          snapTo(SNAP_POINTS.MID)
        } else {
          // Dragging up or neutral - stay EXPANDED
          snapTo(SNAP_POINTS.EXPANDED)
        }
      } else {
        // We're around MID position
        if (event.velocityY < -20) {
          // Dragging up from mid - go to EXPANDED
          snapTo(SNAP_POINTS.EXPANDED)
        } else if (event.velocityY > 20) {
          // Dragging down from mid - go to COLLAPSED
          snapTo(SNAP_POINTS.COLLAPSED)
        } else {
          // Neutral velocity - stay at MID
          snapTo(SNAP_POINTS.MID)
        }
      }
    })

  // Add touch handler for recipe container
  const handleRecipeInteraction = () => {
    snapTo(SNAP_POINTS.COLLAPSED)
  }

  // Initialize sheet position
  useEffect(() => {
    translateY.value = withSpring(SNAP_POINTS.MID, { damping: 20 })
  }, [])

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.recipeContainer} onTouchStart={handleRecipeInteraction}>
        <Recipe
          recipeId={route.params?.recipeId}
          route={route}
          navigation={navigation}
          onScroll={handleRecipeInteraction}
        />
        <Animated.View style={[styles.recipeOverlay, overlayAnimatedStyle]} />
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
          {/* Full-width photo square with drag indicator positioned on top */}
          <Animated.View style={[styles.photoContainer, photoContainerAnimatedStyle]}>
            <Animated.Image
              source={{
                uri: 'https://cooked.wiki/image/photo/41716a53-066e-4370-b2fd-9b5185d1ac6d/862b6721-a7cd-402e-ab46-953cc7b997bf',
              }}
              style={[styles.fullWidthPhoto, imageAnimatedStyle]}
              resizeMode='cover'
            />
            {/* Card header with animated drag indicator positioned absolutely */}
            <Animated.View style={[styles.dragIndicator, dragIndicatorAnimatedStyle]} />
          </Animated.View>

          {/* Profile header */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/43.jpg' }} style={styles.profilePicture} />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>chefmaria</Text>
              <Text style={styles.name}>01/01/2025</Text>
            </View>
            <TouchableOpacity style={styles.expandButtonContainer} onPress={toggleExpansion}>
              <View style={styles.expandButtonWrapper}>
                <View style={[styles.buttonTextContainer]}>
                  <Animated.Text style={[styles.expandButtonText, collapseButtonTextAnimatedStyle]}>
                    Notes
                  </Animated.Text>
                  <Animated.Text style={[styles.expandButtonText, expandButtonTextAnimatedStyle]}>Recipe</Animated.Text>
                </View>
                <Animated.View style={expandButtonIconAnimatedStyle}>
                  <MaterialIcons name='keyboard-arrow-up' size={16} color='white' />
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Notes section */}
          <Animated.View style={[styles.notesContainer, notesContainerAnimatedStyle]}>
            <Text style={styles.notesText}>
              I added a bit more garlic than the recipe called for and used fresh herbs from my garden. The dish turned
              out amazing! Next time I might try adding some red pepper flakes for a bit of heat.
            </Text>

            <Text style={styles.notesTitle}>Modifications:</Text>
            <Text style={styles.notesText}>
              • Substituted chicken broth with vegetable broth to make it vegetarian-friendly • Added 1/4 cup of white
              wine for extra flavor • Used smoked paprika instead of regular for a deeper flavor profile
            </Text>

            <Text style={styles.notesTitle}>Tips:</Text>
            <Text style={styles.notesText}>
              Make sure to let the dish rest for at least 10 minutes before serving - it really helps the flavors meld
              together. This recipe also freezes well for meal prep!
            </Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  recipeContainer: {
    flex: 1,
    zIndex: 1,
  },
  cardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -SCREEN_HEIGHT,
    height: SCREEN_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 10,
  },
  dragIndicator: {
    backgroundColor: theme.colors.primary,
    borderRadius: 2.5,
    position: 'absolute',
    top: 10,
    width: 40,
    height: 5,
    alignSelf: 'center',
    zIndex: 10,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.8,
    padding: 0,
    position: 'relative',
  },
  fullWidthPhoto: {
    width: '100%',
    height: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: theme.colors.secondary,
  },
  profilePicture: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.secondary,
    height: 'auto',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.black,
  },
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  expandButtonContainer: {
    padding: 8,
  },
  expandButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.softBlack,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expandButtonText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  buttonTextContainer: {
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 20,
  },
})

export default observer(Cooked)
