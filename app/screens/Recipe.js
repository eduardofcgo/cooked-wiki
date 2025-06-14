import { useKeepAwake } from 'expo-keep-awake'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  SafeAreaView,
  StatusBar,
  DeviceEventEmitter,
  Platform,
} from 'react-native'
import { IconButton, Menu } from 'react-native-paper'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import RecipeThumbnail from '../components/core/RecipeThumbnail'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import { FontAwesome } from '@expo/vector-icons'
import handler from './webviews/router/handler'
import RecipeWithCookedFeed from '../components/recipe/RecipeWithCookedFeed'
import { useAuth } from '../context/AuthContext'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../urls'
import { MaterialIcons } from '@expo/vector-icons'
import { useInAppNotification } from '../context/NotificationContext'
import RecentlyOpenedCard from '../components/recipe/RecentlyOpenedCard'
import ReportRecipeModal from '../components/recipe/ReportRecipeModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

const RecipeDraftNotesCard = lazy(() => import('../components/recipe/RecipeDraftNotesCard'))

function Recipe({ loadingComponent, navigation, route, cookedCard, cookedCardSheetIndex, ...props }) {
  const { credentials } = useAuth()
  const { clearInAppNotifications } = useInAppNotification()
  const loggedInUsername = credentials.username
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(undefined)
  const [menuVisible, setMenuVisible] = useState(false)
  const [reportModalVisible, setReportModalVisible] = useState(false)

  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent')

      return () => {
        StatusBar.setBackgroundColor(theme.colors.secondary)
        StatusBar.setHidden(false, 'fade')
      }
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, 'fade')
      headerVisible.value = withTiming(1, { duration: 500, useNativeDriver: true })

      return () => {
        StatusBar.setHidden(false, 'fade')
        headerVisible.value = withTiming(0, { duration: 500, useNativeDriver: true })
      }
    }, []),
  )

  const scrollY = useSharedValue(0)
  const lastScrollY = useRef(0)
  const isScrollingDown = useRef(false)
  const headerVisible = useSharedValue(true)

  const handleScroll = useCallback(event => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    const isScrollingDownNow = currentScrollY > lastScrollY.current

    // Only update if we've scrolled more than the threshold
    if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
      if (currentScrollY < 50) {
        setTimeout(() => {
          // StatusBar.setHidden(false, 'fade')
          headerVisible.value = withTiming(1, { duration: 500, useNativeDriver: true })
        }, 1)
      } else if (isScrollingDownNow && headerVisible.value) {
        setTimeout(() => {
          // StatusBar.setHidden(true, 'fade')
          headerVisible.value = withTiming(0, { duration: 500, useNativeDriver: true })
        }, 1)
      } else if (!isScrollingDownNow && !headerVisible.value) {
        const scrollDelta = lastScrollY.current - currentScrollY
        if (scrollDelta > 20) {
          setTimeout(() => {
            // StatusBar.setHidden(false, 'fade')
            headerVisible.value = withTiming(1, { duration: 250, useNativeDriver: true })
          }, 1)
        }
      }
    }

    isScrollingDown.current = isScrollingDownNow
    lastScrollY.current = currentScrollY
    scrollY.value = currentScrollY
  }, [])

  const menuBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(headerVisible.value, [0, 1], [-120, 0], Extrapolate.CLAMP)

    return {
      transform: [{ translateY }],

      // Shadows break with animated opacity on android
      ...(Platform.OS === 'ios'
        ? {
            opacity: interpolate(headerVisible.value, [0, 1], [0, 1], Extrapolate.CLAMP),
          }
        : {}),
    }
  }, [])

  const hasCookedCard = Boolean(cookedCard)

  // Coordenate both cards, TODO: refactor this logic to a UI Store.
  const toggleNotesModal = useCallback(() => {
    const wasCookedCardCollapsed = cookedCardSheetIndex <= 0

    if (!hasCookedCard || wasCookedCardCollapsed) {
      setIsNotesModalVisible(prev => {
        const showNotesModal = !prev
        if (showNotesModal) {
          clearInAppNotifications()
        }
        return showNotesModal
      })
    } else {
      if (cookedCardSheetIndex !== -1) {
        cookedCard?.current?.snapToIndex(0)
      }

      setIsNotesModalVisible(true)
      clearInAppNotifications()
    }
  }, [cookedCard, cookedCardSheetIndex, setIsNotesModalVisible, clearInAppNotifications])

  const recipeId = props.recipeId || route.params?.recipeId
  const extractId = props.extractId || route.params?.extractId
  const refreshKey = route.params?.refreshKey

  // Webview can pass url query params here
  const justSaved = route.params?.queryParams?.saved === 'true'
  const savedExtractionId = route.params?.queryParams?.savedExtractionId
  const cloned = route.params?.queryParams?.cloned === 'true'
  const redirectedFrom = route.params?.queryParams?.redirectedFrom

  // Add a key to force re-render of the RecipeWithCookedFeed component
  const [componentKey, setComponentKey] = useState(Date.now())

  const id = recipeId || extractId

  const { recentlyOpenedStore } = useStore()

  const nextMostRecentRecipe = recentlyOpenedStore.mostRecentRecipesMetadata.find(recipe => recipe.id !== id)
  const hasRecentlyOpenedRecipes = Boolean(nextMostRecentRecipe)

  useEffect(() => {
    if (recipeId || extractId) {
      recentlyOpenedStore.addRecent(recipeId || extractId)
    }

    // A extracted recipe can redirect to a newer version of the same recipe,
    // so we need to remove the older version from the recently opened store.
    if (redirectedFrom) {
      console.log('Removing recipe from recently opened store', redirectedFrom)
      recentlyOpenedStore.remove(redirectedFrom)
    }

    // After saving an extraction, we need to remove it from the recently opened store.
    if (savedExtractionId) {
      console.log('Removing extraction from recently opened store', savedExtractionId)
      recentlyOpenedStore.remove(savedExtractionId)
    }
  }, [recentlyOpenedStore, recipeId, extractId, redirectedFrom, savedExtractionId])

  // Listen for recipe update events (when the user edits a recipe)
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('recipe.updated', event => {
      if (event.recipeId === recipeId) {
        setComponentKey(Date.now())
      }
    })

    return () => subscription.remove()
  }, [recipeId])

  useEffect(() => {
    recentlyOpenedStore.ensureLoadedMetadata()
  }, [])

  const [isExpanded, setIsExpanded] = useState(false)
  const lastPress = useRef(0)
  const [orientation, setOrientation] = useState(0) // 0, 90, 180, 270 degrees
  const rotationValue = useSharedValue(0)

  useKeepAwake()

  const onClickRecipe = useCallback(() => {
    setIsExpanded(false)
  }, [isExpanded])

  const handlePressOrDoublepress = () => {
    const currentTime = new Date().getTime()
    const delta = currentTime - lastPress.current

    const doublePress = delta < 500

    if (doublePress) {
      openMostRecentRecipe()
    } else {
      setIsExpanded(!isExpanded)
    }

    lastPress.current = currentTime
  }

  const openMostRecentRecipe = () => {
    if (nextMostRecentRecipe) {
      openRecipe(nextMostRecentRecipe)
    }
  }

  const onShare = useCallback(() => {
    Share.share({
      message: `Check out this recipe on Cooked.wiki!`,
      url: recipeId ? getSavedRecipeUrl(recipeId) : getRecentExtractUrl(extractId),
    })
  }, [recipeId, extractId])

  const openRecipe = useCallback(
    recipe => {
      console.log('openRecipe', recipe)

      if (recipe.id !== id) {
        navigation.setParams({
          recipeId: recipe.type == 'saved' && recipe.id,
          extractId: recipe.type == 'extracted' && recipe.id,
          recentRecipesExpanded: false,
          queryParams: {},
        })

        setIsNotesModalVisible(false)

        // Force component to re-render with a new key
        setComponentKey(Date.now())
      }

      setIsExpanded(false)
    },
    [recipeId, id],
  )

  const rotateScreen = useCallback(() => {
    const newOrientation = orientation === 0 ? 90 : 0
    setOrientation(newOrientation)
    rotationValue.value = withTiming(newOrientation, { duration: 500 })
  }, [orientation, rotationValue])

  const animatedContentStyle = useAnimatedStyle(() => {
    const isPortrait = orientation % 180 === 0

    return {
      transform: [{ rotate: `${rotationValue.value}deg` }],
      width: isPortrait ? '100%' : SCREEN_HEIGHT,
      height: isPortrait ? '100%' : SCREEN_HEIGHT,
      right: isPortrait ? 0 : 370,
      top: isPortrait ? 0 : 300,
    }
  })

  const routeHandler = useCallback(
    (pathname, queryParams) => {
      return handler(pathname, { navigation, queryParams, loggedInUsername })
    },
    [navigation, loggedInUsername],
  )

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedContentStyle, { flex: 1 }]}>
        <RecipeWithCookedFeed
          key={componentKey}
          recipeId={recipeId}
          extractId={extractId}
          justSaved={justSaved}
          savedExtractionId={savedExtractionId}
          cloned={cloned}
          navigation={navigation}
          onRequestPath={routeHandler}
          route={route}
          disableRefresh={true}
          loadingComponent={loadingComponent}
          contentInsetTop={Platform.OS === 'android' ? 130 - StatusBar.currentHeight : 130}
          onTouchStart={onClickRecipe}
          onScroll={handleScroll}
        />
      </Animated.View>

      <RecentlyOpenedCard
        isExpanded={isExpanded}
        onRecipeSelect={openRecipe}
        onClear={() => {
          setIsExpanded(false)
          recentlyOpenedStore.clear()
        }}
      />

      <SafeAreaView style={styles.safeAreaContainer}>
        <Animated.View style={[styles.menuBarContainer, menuBarAnimatedStyle]}>
          <View style={styles.menuBar}>
            <View style={[styles.menuBarLeft, styles.menuActions]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
                <MaterialIcons name='arrow-back' size={20} color={theme.colors.softBlack} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePressOrDoublepress}
                style={[
                  styles.menuButton,
                  {
                    // marginLeft: -12,
                    backgroundColor: isExpanded ? theme.colors.softBlack : 'transparent',
                  },
                ]}
              >
                <IconButton
                  icon='history'
                  size={22}
                  iconColor={isExpanded ? theme.colors.secondary : theme.colors.softBlack}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.menuBarRight, styles.menuActions]}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name='more-vert' size={20} color={theme.colors.softBlack} />
                  </TouchableOpacity>
                }
                anchorPosition='bottom'
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false)
                    setReportModalVisible(true)
                  }}
                  title='Report'
                />
              </Menu>

              <TouchableOpacity onPress={onShare} style={[styles.menuButton, { marginRight: 8 }]}>
                <FontAwesome name='paper-plane' size={15} color={theme.colors.softBlack} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={toggleNotesModal}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            style={[
              styles.menuBarNavigateButton,
              {
                backgroundColor: isNotesModalVisible ? theme.colors.softBlack : theme.colors.secondary,
              },
            ]}
          >
            <MaterialIcons
              name='edit-note'
              size={28}
              color={isNotesModalVisible ? theme.colors.secondary : theme.colors.softBlack}
            />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      <SafeAreaView
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 600,
          pointerEvents: 'box-none',
        }}
      >
        {isNotesModalVisible && (
          <Suspense fallback={null}>
            <RecipeDraftNotesCard
              recipeId={recipeId}
              extractId={extractId}
              isVisible={isNotesModalVisible}
              isOnTopOfCookedCard={hasCookedCard}
              onClose={() => {
                setIsNotesModalVisible(false)
              }}
            />
          </Suspense>
        )}
      </SafeAreaView>

      <ReportRecipeModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        recipeId={recipeId}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
  },
  menuBarContainer: {
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 8 : StatusBar.currentHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuBar: {
    backgroundColor: theme.colors.secondary,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    flex: 1,
  },
  menuButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
  },
  menuBarNavigateButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: theme.borderRadius.default,
  },
  recipeTitle: {
    fontSize: theme.fontSizes.default,
    textAlign: 'center',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  menuActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 8,
  },
})

export default observer(Recipe)
