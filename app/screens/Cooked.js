import { observer } from 'mobx-react-lite'
import React, { lazy, useEffect, useLayoutEffect, useState } from 'react'
import { Dimensions, StyleSheet, View, Image } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'
import Card from '../components/cooked/Card'
import Notes from '../components/cooked/FullNotes'
import HeaderText from '../components/core/HeaderText'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import useCooked from '../hooks/services/useCooked'
import FullNotes from '../components/cooked/FullNotes'
import { getCookedPhotoUrl, getProfileImageUrl } from '../urls'
import SocialMenu from '../components/cooked/SocialMenu'
import SimilarCookedFeed from '../components/cooked/SimilarCookedFeed'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

// Square photo height, adjust photo to fit the screen
const PHOTO_HEIGHT = SCREEN_HEIGHT - SCREEN_WIDTH

const SNAP_POINTS = {
  // Just enough to preserve the social menu to be able to be expanded
  COLLAPSED: SCREEN_HEIGHT - 110,

  // The mid point should be enough to partially fit the image
  MID: PHOTO_HEIGHT - 125 - 110,

  // At the top
  EXPANDED: 0,
}

// Recipe which contains the webview can be slow to load
// Making sure that it does not make the card animation lag.
const Recipe = lazy(() => import('../screens/Recipe'))

const Cooked = ({ navigation, route }) => {
  const { cookedId, showShareModal } = route.params

  const startPosition = route.params?.startPosition || SCREEN_HEIGHT - 55

  const { cookedStore } = useStore()

  useEffect(() => {
    cookedStore.ensureExists(cookedId)
  }, [cookedId])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(false)
  const [isCardCollapsed, setIsCardCollapsed] = useState(false)

  const cookedPhotoPaths = cooked['cooked-photos-path']
  const recipeId = cooked['recipe-id']
  const extractId = cooked['extract-id']

  // TODO: move to the store and server
  const photoUrls = cookedPhotoPaths?.map(path => getCookedPhotoUrl(path))

  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  const paddingAdjustedStartPosition = startPosition - 55
  const translateY = useSharedValue(paddingAdjustedStartPosition || SNAP_POINTS.COLLAPSED)
  const context = useSharedValue({ y: 0 })
  const scrollEnabled = useSharedValue(false)

  // Derive collapsed state from translateY
  const isCollapsed = useDerivedValue(() => {
    // Consider it collapsed when it's closer to COLLAPSED snap point than MID
    return translateY.value > (SNAP_POINTS.COLLAPSED + SNAP_POINTS.MID) / 2
  })

  // React to changes in the collapsed state
  useAnimatedReaction(
    () => isCollapsed.value,
    (collapsed, previousCollapsed) => {
      if (collapsed !== previousCollapsed) {
        runOnJS(setIsCardCollapsed)(collapsed)
      }
    },
    [isCollapsed],
  )

  // Memoize animation styles to prevent recalculations
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Calculate dynamic height based on position
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.EXPANDED, SNAP_POINTS.MID],
      [SCREEN_HEIGHT * 1.5, SCREEN_HEIGHT - SNAP_POINTS.MID],
      Extrapolate.CLAMP,
    )

    const borderRadius = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED],
      [theme.borderRadius.default, 0],
      Extrapolate.CLAMP,
    )

    return {
      transform: [{ translateY: translateY.value }],
      height,
      minHeight: height,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    }
  }, [])

  const cardContentsAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED], [0, -55], Extrapolate.CLAMP)

    const borderWidth = interpolate(
      translateY.value,
      [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED], // Animate over 20 units after MID point
      [0, 2],
      Extrapolate.CLAMP,
    )

    return {
      transform: [{ translateY: height }],
      borderTopWidth: borderWidth,
      borderTopColor: theme.colors.primary,
    }
  }, [])

  const cardBodyAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      translateY.value,
      [SNAP_POINTS.COLLAPSED, SNAP_POINTS.EXPANDED],
      [0, 500],
      Extrapolate.CLAMP,
    )

    return {
      minHeight: height,
      flexGrow: 1,
    }
  }, [])

  const dragIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [SNAP_POINTS.MID, SNAP_POINTS.COLLAPSED], [1, 0], Extrapolate.CLAMP)

    return {
      opacity,
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
    }
  }, [])

  // Function to snap to a specific position
  const snapTo = point => {
    'worklet'
    translateY.value = withSpring(point, { damping: 20, stiffness: 90 })
    scrollEnabled.value = point === SNAP_POINTS.EXPANDED
  }

  // Function to expand card to mid position when expand icon is pressed
  const expandCard = () => {
    snapTo(SNAP_POINTS.MID)
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
      // Allow scrolling beyond EXPANDED with no restrictions on minimum value
      // Only apply max limit to COLLAPSED (bottom position)
      const newY = Math.min(SNAP_POINTS.COLLAPSED, context.value.y + event.translationY)
      translateY.value = newY

      // Enable scrolling when beyond expanded position
      if (newY <= SNAP_POINTS.EXPANDED) {
        scrollEnabled.value = true
      } else {
        scrollEnabled.value = false
      }
    })
    .onEnd(event => {
      const currentPosition = translateY.value

      // If we're beyond EXPANDED (negative values), apply scroll physics
      if (currentPosition < SNAP_POINTS.EXPANDED) {
        scrollEnabled.value = true
        return
      }

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

      // Regular snapping logic for positions between EXPANDED and COLLAPSED
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

    // just to slow down the recipe loading to avoid frame drops on the card open animation
    const timer = setTimeout(() => {
      setShouldLoadRecipe(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showShareModal) {
      setShouldShowShareCook(true)
    }
  }, [showShareModal])

  // Placeholder function for sharing (remains mostly the same, just hides inline component)
  const handleShare = () => {
    console.log('Sharing cooked item:', cooked)
    // Implement actual sharing logic here
    setShouldShowShareCook(false)
  }

  // Function to dismiss the inline ShareCook component
  const handleDismissShareCook = () => {
    setShouldShowShareCook(false)
  }

  if (!cookedLoadState || cookedLoadState === 'loading') {
    return <LoadingScreen />
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
        <Animated.View style={[styles.cardContainerStyle, cardAnimatedStyle]}>
          <Animated.View style={[cardContentsAnimatedStyle, { flex: 1 }]}>
            <Animated.View style={[styles.dragIndicator, dragIndicatorAnimatedStyle]} />

            <SocialMenu
              cookedId={cookedId}
              showExpandIcon={isCardCollapsed}
              onExpandPress={expandCard}
              profileImage={getProfileImageUrl(cooked['username'])}
              username={cooked['username']}
              date={cooked['cooked-date']}
              roundedBottom={false}
            />

            <Animated.View style={[styles.cardBodyStyle, cardBodyAnimatedStyle]}>
              <FullNotes notes={cooked['notes']} />

              {photoUrls && photoUrls.length > 0 && (
                <View style={styles.photoContainer}>
                  {photoUrls.map((photoUrl, index) => (
                    <Image key={index} source={{ uri: photoUrl }} style={styles.photoBelow} resizeMode='cover' />
                  ))}

                  <SimilarCookedFeed recipeId={recipeId || extractId} />
                </View>
              )}
            </Animated.View>
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
  cardContainerStyle: {
    width: '100%',
    backgroundColor: theme.colors.white,
  },
  cardBodyStyle: {
    paddingHorizontal: 16,
    flex: 1,
    minHeight: SCREEN_HEIGHT - SNAP_POINTS.MID + 60,
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
    userSelect: 'none',
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
  photoContainer: {
    paddingVertical: 16,
    flex: 1,
    gap: 16,
    flexGrow: 1,
  },
  photoBelow: {
    width: '100%',
    aspectRatio: 1,
  },
})

export default observer(Cooked)
