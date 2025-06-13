import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeOutUp, FadeInUp } from 'react-native-reanimated'
import RecipeThumbnail from '../core/RecipeThumbnail'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'
import { Platform, StatusBar } from 'react-native'

const RecentlyOpenedCard = ({ isExpanded, onRecipeSelect, onClear }) => {
  const { recentlyOpenedStore } = useStore()

  const handleRecipeSelect = useCallback(
    recipe => {
      if (onRecipeSelect) {
        onRecipeSelect(recipe)
      }
    },
    [onRecipeSelect],
  )

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear()
    }
  }, [onClear])

  if (!isExpanded) {
    return null
  }

  return (
    <Animated.View style={styles.recentContainer} entering={FadeInUp.duration(300)} exiting={FadeOutUp.duration(300)}>
      <View style={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
          {recentlyOpenedStore.mostRecentRecipesMetadata.map((recipe, index) => (
            <TouchableOpacity
              key={recipe.id}
              style={[styles.recipeCard, index === 0 && { marginLeft: 16 }]}
              onPress={() => handleRecipeSelect(recipe)}
            >
              <RecipeThumbnail thumbnailUrl={recipe?.['thumbnail-url']} title={recipe.title} type={recipe.type} />
            </TouchableOpacity>
          ))}
          {recentlyOpenedStore.mostRecentRecipesMetadata.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
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
  )
}

const styles = StyleSheet.create({
  recentContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 144 - StatusBar.currentHeight : 144,
    left: 16,
    right: 16,
    height: 180, // Fixed height for the panel
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  scrollContainer: {
    position: 'relative',
    flex: 1,
  },
  recipeCard: {
    marginTop: 16,
    width: 110,
    marginRight: 16,
  },
})

export default observer(RecentlyOpenedCard)
