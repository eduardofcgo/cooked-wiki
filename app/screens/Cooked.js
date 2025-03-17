import { observer } from 'mobx-react-lite'
import React, { useEffect, useLayoutEffect, useState } from 'react'
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
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

// Square
const PHOTO_HEIGHT = SCREEN_HEIGHT - SCREEN_WIDTH

const SNAP_POINTS = {
  COLLAPSED: SCREEN_HEIGHT - 120, //PHOTO_HEIGHT - 110,
  MID: PHOTO_HEIGHT - 125 - 110,
  EXPANDED: 0, // At the top
}

// Replace the direct import with lazy loading
const Recipe = React.lazy(() => import('../screens/webviews/Recipe'))

const Cooked = ({ navigation, route }) => {
  const { preloadedCooked, cookedId } = route.params
  const startPosition = route.params?.startPosition?.y || SCREEN_HEIGHT - 55

  const { profileStore } = useStore()

  const [loadingCooked, setLoadingCooked] = useState(!preloadedCooked)
  const [cooked, setCooked] = useState(preloadedCooked)

  const recipeId = cooked['recipe-id']
  const extractId = cooked['extract-id']

  useEffect(() => {
    ;(async () => {
      if (!preloadedCooked) {
        setLoadingCooked(true)
        const cooked = await profileStore.getCooked(loggedInUsername, cookedId)
        setCooked(cooked)
        setLoadingCooked(false)
      }
    })()
  }, [cookedId])

  // Add state to control when to load the Recipe component
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  // Animation values
  const translateY = useSharedValue(startPosition || SNAP_POINTS.COLLAPSED)
  const context = useSharedValue({ y: 0 })
  const scrollEnabled = useSharedValue(false)

  // Memoize animation styles to prevent recalculations
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Calculate dynamic height based on position
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.EXPANDED, SNAP_POINTS.MID],
      [SCREEN_HEIGHT, SCREEN_HEIGHT - SNAP_POINTS.MID],
      Extrapolate.CLAMP,
    )

    return {
      transform: [{ translateY: translateY.value }],
      height,
    }
  }, [])

  const photoContainerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
      [2, SCREEN_WIDTH],
      Extrapolate.CLAMP,
    )

    return {
      // transform: [{ translateY: height }],
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

  const contentsAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED], [0, 400], Extrapolate.CLAMP)

    return {
      transform: [{ translateY: -height }],
    }
  }, [])

  const cardBodyAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED, SNAP_POINTS.EXPANDED],
      [50, 500],
      Extrapolate.CLAMP,
    )

    return {
      minHeight: height,
    }
  }, [])

  const dragIndicatorAnimatedStyle = useAnimatedStyle(() => {
    // Transform the drag indicator into a border when collapsed
    const width = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID],
      [SCREEN_WIDTH, 40],
      Extrapolate.CLAMP,
    )

    const y = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED - 50, SNAP_POINTS.COLLAPSED],
      [0, -42],
      Extrapolate.CLAMP,
    )

    const shadowOpacity = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
      [0.2, 0],
      Extrapolate.CLAMP,
    )

    const top = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [0, 10], Extrapolate.CLAMP)

    const height = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [2, 5], Extrapolate.CLAMP)

    const opacity = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.EXPANDED], [1, 0], Extrapolate.CLAMP)

    return {
      top,
      width,
      height,
      opacity,
      transform: [{ translateY: y }],
      shadowOpacity,
    }
  }, [])

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    let opacity

    if (translateY.value >= SNAP_POINTS.MID) {
      opacity = interpolate(translateY.value, [SNAP_POINTS.COLLAPSED, SNAP_POINTS.MID], [0, 0.75], Extrapolate.CLAMP)
    } else {
      opacity = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.EXPANDED], [0.75, 1], Extrapolate.CLAMP)
    }

    return {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
      pointerEvents: opacity > 0.6 ? 'auto' : 'none',
    }
  }, [])

  // Function to snap to a specific position
  const snapTo = point => {
    'worklet'
    translateY.value = withSpring(point, { damping: 20, stiffness: 90 })
    scrollEnabled.value = point === SNAP_POINTS.EXPANDED
  }

  // Add touch handler for recipe container
  const handleRecipeInteraction = () => {
    snapTo(SNAP_POINTS.COLLAPSED)
  }

  // Setup pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate(event => {
      // Update position based on gesture, ensuring it doesn't go beyond limits
      const newY = Math.max(SNAP_POINTS.EXPANDED, Math.min(SNAP_POINTS.COLLAPSED, context.value.y + event.translationY))
      translateY.value = newY
    })
    .onEnd(event => {
      // Determine which snap point we were closest to at the START of the gesture
      let startingSnapPoint
      const startPosition = context.value.y

      if (startPosition <= SNAP_POINTS.EXPANDED + 20) {
        startingSnapPoint = SNAP_POINTS.EXPANDED
      } else if (startPosition <= SNAP_POINTS.MID + 20) {
        startingSnapPoint = SNAP_POINTS.MID
      } else {
        startingSnapPoint = SNAP_POINTS.COLLAPSED
      }

      // Always move exactly one step in the direction of the swipe
      if (event.velocityY > 300) {
        // Downward swipe with significant velocity
        if (startingSnapPoint === SNAP_POINTS.EXPANDED) {
          snapTo(SNAP_POINTS.MID)
        } else if (startingSnapPoint === SNAP_POINTS.MID) {
          snapTo(SNAP_POINTS.COLLAPSED)
        } else {
          snapTo(SNAP_POINTS.COLLAPSED) // Already at bottom, stay there
        }
      } else if (event.velocityY < -300) {
        // Upward swipe with significant velocity
        if (startingSnapPoint === SNAP_POINTS.COLLAPSED) {
          snapTo(SNAP_POINTS.MID)
        } else if (startingSnapPoint === SNAP_POINTS.MID) {
          snapTo(SNAP_POINTS.EXPANDED)
        } else {
          snapTo(SNAP_POINTS.EXPANDED) // Already at top, stay there
        }
      } else {
        // For gentle swipes or no clear direction, snap to the closest point
        const currentPosition = translateY.value
        if (currentPosition < SNAP_POINTS.MID - (SNAP_POINTS.MID - SNAP_POINTS.EXPANDED) / 2) {
          snapTo(SNAP_POINTS.EXPANDED)
        } else if (currentPosition < SNAP_POINTS.COLLAPSED - (SNAP_POINTS.COLLAPSED - SNAP_POINTS.MID) / 2) {
          snapTo(SNAP_POINTS.MID)
        } else {
          snapTo(SNAP_POINTS.COLLAPSED)
        }
      }
    })

  useLayoutEffect(() => {
    translateY.value = withSpring(SNAP_POINTS.MID, { damping: 20 })

    const timer = setTimeout(() => {
      setShouldLoadRecipe(true)
    }, 250)

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
        onTouchStart={handleRecipeInteraction}
      >
        {shouldLoadRecipe ? (
          <Recipe recipeId={recipeId} extractId={extractId} route={route} navigation={navigation} />
        ) : (
          <LoadingScreen />
        )}
        <Animated.View style={[styles.recipeOverlay, overlayAnimatedStyle]} />
      </View>

      <GestureDetector gesture={panGesture}>
        <Card
          cooked={cooked}
          relativeDate={false}
          showShareIcon={true}
          containerStyle={cardAnimatedStyle}
          photoStyle={imageAnimatedStyle}
          photoContainerStyle={photoContainerAnimatedStyle}
          contentsStyle={contentsAnimatedStyle}
          bodyStyle={cardBodyAnimatedStyle}
          renderDragIndicator={renderDragIndicator}
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
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
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
