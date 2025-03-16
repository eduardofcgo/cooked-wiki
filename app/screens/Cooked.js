import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import SocialMenu from '../components/cooked/SocialMenu'
import { theme } from '../style/style'
import LoadingScreen from './Loading'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50
const SNAP_POINTS = {
  COLLAPSED: -85,
  MID: -SCREEN_HEIGHT * 0.7,
  EXPANDED: -SCREEN_HEIGHT + 50,
}

// Replace the direct import with lazy loading
const Recipe = React.lazy(() => import('../screens/webviews/Recipe'))

const Cooked = ({ navigation, route }) => {
  // Add state to control when to load the Recipe component
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  // Animation values
  const translateY = useSharedValue(SNAP_POINTS.COLLAPSED)
  const context = useSharedValue({ y: 0 })
  const scrollEnabled = useSharedValue(false)

  // Memoize animation styles to prevent recalculations
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  }, []) // Add dependency array to prevent unnecessary recalculations

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
  }, [])

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
  }, [])

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
  }, [])

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
  }, [])

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
  }, [])

  // Calculate if we should show expand or share icon based on translateY position
  const shouldShowExpandIcon = () => {
    'worklet'
    return translateY.value >= SNAP_POINTS.MID
  }

  const shouldShowShareIcon = () => {
    'worklet'
    return translateY.value <= SNAP_POINTS.MID
  }

  // Determine which action to perform when the button is pressed
  const handleSocialMenuAction = () => {
    if (translateY.value >= SNAP_POINTS.MID) {
      toggleExpansion()
    } else {
      handleShare()
    }
  }

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

  // Add touch handler for recipe container
  const handleRecipeInteraction = () => {
    snapTo(SNAP_POINTS.COLLAPSED)
  }

  // Add this function to handle sharing
  const handleShare = () => {
    // Implement sharing functionality here
    console.log('Share recipe')
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

  // Initialize sheet position and delay loading the Recipe
  useLayoutEffect(() => {
    // Use a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      translateY.value = withSpring(SNAP_POINTS.MID, { damping: 20 })

      // Delay loading the Recipe component until after the card animation
      setTimeout(() => {
        setShouldLoadRecipe(true)
      }, 300)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.recipeContainer} onTouchStart={handleRecipeInteraction}>
        {shouldLoadRecipe ? (
          <React.Suspense fallback={<LoadingScreen />}>
            <Recipe
              recipeId={route.params?.recipeId}
              route={route}
              navigation={navigation}
              onScroll={handleRecipeInteraction}
            />
          </React.Suspense>
        ) : (
          <View style={styles.recipePlaceholder} />
        )}
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
          <SocialMenu
            onActionPress={handleSocialMenuAction}
            profileImage='https://randomuser.me/api/portraits/women/43.jpg'
            username='chefmaria'
            date='01/01/2025'
            showExpandIcon={shouldShowExpandIcon()}
            showShareIcon={shouldShowShareIcon()}
          />

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
  recipePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})

export default observer(Cooked)
