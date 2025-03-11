import React, { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native'
import CookedWebView from '../components/CookedWebView'
import { IconButton, shadow } from 'react-native-paper'
import { theme } from '../style/style'
import Share from 'react-native/Libraries/Share/Share'
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolate } from 'react-native-reanimated'
import { useKeepAwake } from 'expo-keep-awake'

const RECENT_RECIPES = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/carbonara',
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/tikka',
  },
  {
    id: 3,
    title: 'Classic Burger',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/burger',
  },
  {
    id: 4,
    title: 'Caesar Salad',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/caesar',
  },
  {
    id: 5,
    title: 'Greek Salad',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/greek',
  },
  {
    id: 6,
    title: 'Pad Thai',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/padthai',
  },
  {
    id: 7,
    title: 'Fish Tacos',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/fishtacos',
  },
  {
    id: 8,
    title: 'Mushroom Risotto',
    thumbnail: 'https://picsum.photos/200/200',
    url: 'https://example.com/risotto',
  },
]

export default function Recipe({ startUrl, loadingComponent, navigation, route }) {
  const recipeUrl = route.params?.recipeUrl || startUrl

  const [isExpanded, setIsExpanded] = useState(false)
  const scrollViewRef = useRef(null)
  const headerHeight = useSharedValue(0)
  const [scrollPosition, setScrollPosition] = useState(0)

  useKeepAwake()

  const toggleHeader = () => {
    setIsExpanded(!isExpanded)
    headerHeight.value = withTiming(isExpanded ? 0 : 170, {
      duration: 300,
    })
  }

  const openRecipe = url => {
    navigation.setParams({ recipeUrl: url })
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
            }}
          >
            Recipe
          </Text>
          <IconButton
            icon='history'
            size={20}
            onPress={toggleHeader}
            color={theme.colors.softBlack}
            style={{ marginRight: -8, marginTop: 10 }}
          />
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
                message: recipeUrl,
                url: recipeUrl,
              })
            }}
          />
        </View>
      ),
    })
  }, [navigation, toggleHeader, isExpanded])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.recentContainer, animatedStyles]}>
        <View style={styles.scrollContainer}>
          <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
            {RECENT_RECIPES.map((recipe, index) => (
              <TouchableOpacity
                key={recipe.id}
                style={[styles.recipeCard, index === 0 && { marginLeft: 16 }]}
                onPress={() => openRecipe(recipe.url)}
              >
                <Image source={{ uri: recipe.thumbnail }} style={styles.thumbnail} />
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <CookedWebView
        startUrl={recipeUrl}
        navigation={navigation}
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
