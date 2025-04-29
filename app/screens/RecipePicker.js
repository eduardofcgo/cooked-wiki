import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  DeviceEventEmitter,
  StatusBar,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../style/style'
import Loading from '../components/core/Loading'
import { Button, SecondaryButton } from '../components/core/Button'
import FadeInStatusBar from '../components/FadeInStatusBar'
import { useStore } from '../context/StoreContext'

// Temporary mock data
const allRecipes = [
  { id: '1', name: 'Spaghetti Carbonara', lastCooked: '2 days ago' },
  { id: '2', name: 'Chicken Curry', lastCooked: '1 week ago' },
  { id: '3', name: 'Beef Stir Fry', lastCooked: '2 weeks ago' },
  { id: '4', name: 'Pizza Margherita', lastCooked: '1 month ago' },
  { id: '5', name: 'Caesar Salad', lastCooked: '3 weeks ago' },
]

const RecipeItem = ({ recipe, onSelect }) => (
  <TouchableOpacity style={styles.recipeItem} onPress={() => onSelect(recipe)}>
    <View style={styles.recipeItemContent}>
      <Image
        source={{
          uri: 'https://cooked.wiki/imgproxy/unsafe/resizing_type:fill/width:250/height:250/enlarge:1/quality:90/MTI2Y2UzYjQtZTE0Ni00N2VmLWFiZmYtMjI5NTk0YjhjZTJm.jpg',
        }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <Text style={styles.recipeDate}>{recipe.lastCooked}</Text>
      </View>
    </View>
  </TouchableOpacity>
)

export default function RecipePicker({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('')

  const { recentlyOpenedStore } = useStore()
  const recentRecipes = recentlyOpenedStore.recipes

  const handleRecipeSelect = recipe => {
    DeviceEventEmitter.emit('event.selectedRecipe', recipe)
    navigation.goBack()
  }

  const handleNoRecipeSelect = () => {
    DeviceEventEmitter.emit('event.selectedRecipe', null)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <FadeInStatusBar />
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name='magnify' size={20} color={theme.colors.softBlack} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search recipes'
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={theme.colors.primary}
          autoCapitalize='none'
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name='close' size={20} color={theme.colors.softBlack} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.resultsContainer}>
        <TouchableOpacity style={styles.freestyleCard} onPress={handleNoRecipeSelect}>
          <View style={styles.freestyleContent}>
            <MaterialCommunityIcons name='chef-hat' size={24} color={theme.colors.softBlack} />
            <View style={styles.freestyleTextContainer}>
              <Text style={styles.freestyleTitle}>Cooked without a recipe</Text>
              <Text style={styles.freestyleSubtitle}>Freestyle cooking</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.subtitle}>
          {searchQuery ? (
            'Search Results'
          ) : (
            <View style={styles.subtitleContainer}>
              <MaterialCommunityIcons name='history' size={16} color={theme.colors.softBlack} />
              <Text style={styles.subtitleText}>Recently opened</Text>
            </View>
          )}
        </Text>

        {recentRecipes.length > 0 ? (
          <FlatList
            data={recentRecipes}
            renderItem={({ item }) => <RecipeItem recipe={item} onSelect={handleRecipeSelect} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.emptySearchText}>No recent recipes found. You can search to choose a recipe.</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.secondary,
    margin: 16,
    marginTop: 16,
    borderRadius: theme.borderRadius.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: theme.borderRadius.default,
    marginBottom: 10,
    height: 70,
  },
  recipeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipeImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.default,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  recipeName: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 4,
  },
  recipeDate: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    opacity: 0.7,
  },
  emptySearchText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleText: {
    marginLeft: 4,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
  },
  freestyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: theme.borderRadius.default,
    marginBottom: 16,
    height: 70,
  },
  freestyleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freestyleTextContainer: {
    marginLeft: 12,
  },
  freestyleTitle: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 4,
  },
  freestyleSubtitle: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    opacity: 0.7,
  },
})
