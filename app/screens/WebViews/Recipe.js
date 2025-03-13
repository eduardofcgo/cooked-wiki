import { useKeepAwake } from 'expo-keep-awake'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Share from 'react-native/Libraries/Share/Share'
import CookedWebView from '../../components/CookedWebView'
import RecipeThumbnail from '../../components/core/RecipeThumbnail'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import { getExtractUrl, getSavedRecipeUrl } from '../../urls'
import handler from './router/handler'

export default function Recipe({ loadingComponent, navigation, route }) {
  const recipeId = route.params?.recipeId
  const extractId = route.params?.extractId

  const { recentlyOpenedStore } = useStore()
  const nextMostRecentRecipe = recentlyOpenedStore.recipes.find(
    recipe => recipe.recipeId !== recipeId || recipe.extractId !== extractId
  )
  const hasRecentlyOpennedRecipes = Boolean(nextMostRecentRecipe)

  useEffect(() => {
    recentlyOpenedStore.addRecent({ recipeId, extractId })
  }, [recentlyOpenedStore, recipeId, extractId])

  const [isExpanded, setIsExpanded] = useState(false)
  const scrollViewRef = useRef(null)
  const headerHeight = useSharedValue(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const lastPress = useRef(0)

  useKeepAwake()

  const toggleHeader = () => {
    setIsExpanded(!isExpanded)
    headerHeight.value = withTiming(isExpanded ? 0 : 170, {
      duration: 300,
    })
  }

  const handlePressOrDoublepress = () => {
    const currentTime = new Date().getTime()
    const delta = currentTime - lastPress.current

    if (delta < 500) {
      openMostRecentRecipe()
    } else {
      toggleHeader()
    }
    lastPress.current = currentTime
  }

  const openMostRecentRecipe = () => {
    if (nextMostRecentRecipe) {
      openRecipe(nextMostRecentRecipe)
    }
  }

  const openRecipe = recipe => {
    navigation.setParams({
      recipeId: recipe.recipeId,
      extractId: recipe.extractId,
    })
    setIsExpanded(false)

    headerHeight.value = withTiming(0, {
      duration: 250,
    })
  }

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    }
  })

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: theme.fontSizes.large,
              fontFamily: theme.fonts.title,
              color: theme.colors.black,
            }}>
            Recipe
          </Text>
          {hasRecentlyOpennedRecipes && (
            <IconButton
              icon='history'
              size={20}
              onPress={handlePressOrDoublepress}
              color={theme.colors.softBlack}
              style={{ marginRight: -8, marginTop: 10 }}
            />
          )}
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon='share'
            size={20}
            color={theme.colors.softBlack}
            style={{ marginRight: -8 }}
            onPress={() => {
              Share.share({
                message: '/saved',
                url: `/saved/${recipeId}`,
              })
            }}
          />
        </View>
      ),
    })
  }, [navigation, toggleHeader, isExpanded])

  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation })
    },
    [navigation]
  )

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.recentContainer, animatedStyles]}>
        <View style={styles.scrollContainer}>
          <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
            {recentlyOpenedStore.recipes
              .filter(recipe => recipe.recipeId !== recipeId || recipe.extractId !== extractId)
              .map((recipe, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.recipeCard, index === 0 && { marginLeft: 16 }]}
                  onPress={() => openRecipe(recipe)}>
                  <RecipeThumbnail recipeId={recipe.recipeId} extractId={recipe.extractId} />
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </Animated.View>

      <CookedWebView
        key={recipeId + extractId}
        startUrl={extractId ? getExtractUrl(extractId) : getSavedRecipeUrl(recipeId)}
        navigation={navigation}
        onRequestPath={routeHandler}
        route={route}
        disableRefresh={true}
        loadingComponent={loadingComponent}
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
})
