import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Card from '../components/cooked/Card'
import { theme } from '../style/style'
import LoadingScreen from './Loading'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50

// Square
const PHOTO_HEIGHT = SCREEN_HEIGHT - SCREEN_WIDTH

const SNAP_POINTS = {
  COLLAPSED: PHOTO_HEIGHT - 125,
  MID: PHOTO_HEIGHT - 125 - 110,
  EXPANDED: 0, // At the top
}

// Replace the direct import with lazy loading
const Recipe = React.lazy(() => import('../screens/webviews/Recipe'))

const Cooked = ({ navigation, route }) => {
  // Get the startPosition from route params
  const startPosition = route.params?.startPosition?.y || SCREEN_HEIGHT - 55

  // Add state to control when to load the Recipe component
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  // Animation values
  const translateY = useSharedValue(startPosition || SNAP_POINTS.COLLAPSED)
  const context = useSharedValue({ y: 0 })
  const scrollEnabled = useSharedValue(false)

  // Instead of accessing translateY.value directly in any JS function,
  // let's create a regular state variable to track the current position
  const [isExpanded, setIsExpanded] = useState(false)

  // Use useAnimatedReaction to update the state variable
  // useAnimatedReaction(
  //   () => translateY.value,
  //   currentValue => {
  //     const shouldBeExpanded = currentValue <= SNAP_POINTS.MID
  //     if (shouldBeExpanded !== isExpanded) {
  //       runOnJS(setIsExpanded)(shouldBeExpanded)
  //     }
  //   }
  // )

  // Memoize animation styles to prevent recalculations
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  }, [])

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
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
      [2, SCREEN_WIDTH],
      Extrapolate.CLAMP
    )

    return {
      transform: [{ translateY: height }],
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

  // Now use the state variable instead of accessing translateY.value directly
  const handleSocialMenuAction = () => {
    if (!isExpanded) {
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

  useLayoutEffect(() => {
    translateY.value = withSpring(SNAP_POINTS.MID, { damping: 20 })

    const timer = setTimeout(() => {
      setShouldLoadRecipe(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Function to render the animated drag indicator
  const renderDragIndicator = () => {
    return <Animated.View style={[styles.dragIndicator, dragIndicatorAnimatedStyle]} />
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View
        style={{ zIndex: -10, flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onTouchStart={handleRecipeInteraction}>
        {shouldLoadRecipe ? (
          <Recipe
            recipeId={'3d88ee27-a214-403e-95d8-5aae6f468e35'}
            route={route}
            navigation={navigation}
            onScroll={handleRecipeInteraction}
          />
        ) : (
          <LoadingScreen />
        )}
        <Animated.View style={[styles.recipeOverlay, overlayAnimatedStyle]} />
      </View>

      <GestureDetector gesture={panGesture}>
        <Card
          photoUri={
            'https://cooked.wiki/imgproxy/unsafe/resizing_type:fill/width:1080/height:1080/quality:75/NDE3MTZhNTMtMDY2ZS00MzcwLWIyZmQtOWI1MTg1ZDFhYzZkLzg2MmI2NzIxLWE3Y2QtNDAyZS1hYjQ2LTk1M2NjN2I5OTdiZg.jpg'
          }
          profileImage={'https://randomuser.me/api/portraits/women/43.jpg'}
          username={'chefmaria'}
          date={'01/01/2025'}
          showShareIcon={true}
          notes={
            'I added a bit more garlic than the recipe called for and used fresh herbs from my garden. The dish turned out amazing! Next time I might try adding some red pepper flakes for a bit of heat.'
          }
          containerStyle={cardAnimatedStyle}
          photoStyle={imageAnimatedStyle}
          photoContainerStyle={photoContainerAnimatedStyle}
        />
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
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  recipePlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardContentContainer: {
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 0,
  },
})

export default observer(Cooked)
