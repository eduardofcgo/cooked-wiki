import { useKeepAwake } from 'expo-keep-awake'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native'
import { IconButton } from 'react-native-paper'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import RecipeThumbnail from '../components/core/RecipeThumbnail'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import { FontAwesome } from '@expo/vector-icons'
import handler from './webviews/router/handler'
import RecipeWithCookedFeed from '../components/recipe/RecipeWithCookedFeed'
import { useAuth } from '../context/AuthContext'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../urls'
import { MaterialIcons } from '@expo/vector-icons'
import RecipeDraftNotesCard from '../components/recipe/RecipeDraftNotesCard'
import { useInAppNotification } from '../context/NotificationContext'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

function Recipe({ loadingComponent, navigation, route, cookedCard, cookedCardSheetIndex, ...props }) {
  const { credentials } = useAuth()
  const { clearInAppNotifications } = useInAppNotification()
  const loggedInUsername = credentials.username
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(undefined)

  const hasCookedCard = Boolean(cookedCard)

  // Coordenate both cards, TODO: refactor this logic to a UI Store.
  const toggleNotesModal = useCallback(() => {
    const wasCookedCardCollapsed = cookedCardSheetIndex === 0

    if (!hasCookedCard || wasCookedCardCollapsed) {
      setIsNotesModalVisible(prev => {
        const showNotesModal = !prev
        if (showNotesModal) {
          clearInAppNotifications()
        }
        return showNotesModal
      })
    } else {
      cookedCard?.current?.snapToIndex(0)
      setIsNotesModalVisible(true)
      clearInAppNotifications()
    }
  }, [cookedCard, cookedCardSheetIndex, setIsNotesModalVisible, clearInAppNotifications])

  const recipeId = props.recipeId || route.params?.recipeId
  const extractId = props.extractId || route.params?.extractId

  // Webview can pass url query params here
  const justSaved = route.params?.queryParams?.saved === 'true'
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
  }, [recentlyOpenedStore, recipeId, extractId, redirectedFrom])

  // Update the key whenever recipe/extract ID changes to force re-render
  useEffect(() => {
    setComponentKey(Date.now())
  }, [recipeId, extractId])

  useEffect(() => {
    recentlyOpenedStore.ensureLoadedMetadata()
  }, [])

  const [isExpanded, setIsExpanded] = useState(false)
  const scrollViewRef = useRef(null)
  const headerHeight = useSharedValue(0)
  const lastPress = useRef(0)
  const [orientation, setOrientation] = useState(0) // 0, 90, 180, 270 degrees
  const rotationValue = useSharedValue(0)

  useKeepAwake()

  const handleScroll = useCallback(
    event => {
      // const currentScrollPosition = event.nativeEvent.contentOffset.y
      // setScrollPosition(currentScrollPosition)
      // // Close expanded section when scrolling
      // if (isExpanded) {
      //   setIsExpanded(false)
      // }
    },
    [isExpanded],
  )

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

  useEffect(() => {
    headerHeight.value = withTiming(!isExpanded ? 0 : 170 + 8, {
      duration: 300,
    })
  }, [isExpanded, setIsExpanded])

  const onShare = useCallback(() => {
    Share.share({
      message: `Check out this recipe on Cooked!`,
      url: recipeId ? getSavedRecipeUrl(recipeId) : getRecentExtractUrl(extractId),
    })
  }, [recipeId, extractId])

  const openRecipe = useCallback(
    recipe => {
      console.log('openRecipe', recipe)

      if (recipe.id !== id) {
        console.log('[Recipe] Opening recipe:', {
          recipeId: recipe.type == 'saved' && recipe.id,
          extractId: recipe.type == 'extracted' && recipe.id,
          recentRecipesExpanded: false,
        })

        navigation.setParams({
          recipeId: recipe.type == 'saved' && recipe.id,
          extractId: recipe.type == 'extracted' && recipe.id,
          recentRecipesExpanded: false,
        })

        setIsNotesModalVisible(false)

        // Force component to re-render with a new key
        setComponentKey(Date.now())
      }

      setIsExpanded(false)
    },
    [recipeId, id],
  )

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    }
  })

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
      top: isPortrait ? 0 : 30,
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity onPress={handlePressOrDoublepress} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon='history'
            size={20}
            color={theme.colors.softBlack}
            style={{
              marginLeft: -8,
              marginRight: 4,
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              marginBottom: 16,
              fontSize: theme.fontSizes.large,
              fontFamily: theme.fonts.title,
              color: theme.colors.black,
            }}
          >
            Recipe
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          {/* <IconButton
            icon='rotate-right'
            size={24}
            color={theme.colors.softBlack}
            style={{ marginRight: -8 }}
            onPress={rotateScreen}
          /> */}

          <TouchableOpacity onPress={onShare}>
            <FontAwesome name='paper-plane' size={16} color={theme.colors.softBlack} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleNotesModal}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            style={{
              backgroundColor: isNotesModalVisible ? theme.colors.softBlack : 'transparent',
              borderRadius: 100,
              paddingRight: 6,
              paddingLeft: 6,
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <MaterialIcons
              name='edit-note'
              size={28}
              color={isNotesModalVisible ? theme.colors.secondary : theme.colors.softBlack}
            />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [
    hasRecentlyOpenedRecipes,
    navigation,
    isExpanded,
    orientation,
    onShare,
    cookedCardSheetIndex,
    cookedCard,
    isNotesModalVisible,
  ])

  const routeHandler = useCallback(
    (pathname, queryParams) => {
      return handler(pathname, { navigation, queryParams, loggedInUsername })
    },
    [navigation, loggedInUsername],
  )

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.recentContainer, animatedStyles]}>
        <View style={styles.scrollContainer}>
          <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
            {recentlyOpenedStore.mostRecentRecipesMetadata.map((recipe, index) => (
              <TouchableOpacity
                key={recipe.id}
                style={[styles.recipeCard, index === 0 && { marginLeft: 16 }]}
                onPress={() => openRecipe(recipe)}
              >
                <RecipeThumbnail thumbnailUrl={recipe?.['thumbnail-url']} title={recipe.title} type={recipe.type} />
              </TouchableOpacity>
            ))}
            {recentlyOpenedStore.mostRecentRecipesMetadata.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setIsExpanded(false)
                  recentlyOpenedStore.clear()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  marginRight: 32,
                }}
              >
                <Text style={{ color: theme.colors.softBlack }}>Clear</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  marginRight: 32,
                  marginLeft: 16,
                }}
              >
                <Text style={{ color: theme.colors.softBlack }}>No recent recipes</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View style={[animatedContentStyle, { flex: 1 }]}>
        <RecipeWithCookedFeed
          key={componentKey}
          recipeId={recipeId}
          extractId={extractId}
          justSaved={justSaved}
          cloned={cloned}
          navigation={navigation}
          onRequestPath={routeHandler}
          route={route}
          disableRefresh={true}
          loadingComponent={loadingComponent}
          onScroll={handleScroll}
        />
      </Animated.View>

      <RecipeDraftNotesCard
        recipeId={recipeId}
        extractId={extractId}
        isVisible={isNotesModalVisible}
        isOnTopOfCookedCard={hasCookedCard}
        onClose={() => {
          setIsNotesModalVisible(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    position: 'relative',
    flex: 1,
  },
  recentContainer: {
    backgroundColor: theme.colors.secondary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  recipeCard: {
    marginTop: 16,
    width: 110,
    marginRight: 16,
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
  webViewContainer: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },
})

export default observer(Recipe)
