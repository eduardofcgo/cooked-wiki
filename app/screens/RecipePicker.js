import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, DeviceEventEmitter } from 'react-native'
import FastImage from 'react-native-fast-image'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../style/style'
import { useStore } from '../context/StoreContext'
import moment from 'moment'
import useUserRecipesSearch from '../hooks/api/useUserRecipesSearch'
import Loading from '../components/core/Loading'
import { FlashList } from '@shopify/flash-list'

const Image = FastImage

const FlatList = FlashList

const RecipeItem = ({ thumbnailUrl, title, openedAt, onSelect }) => {
  const formattedTime = useMemo(() => (openedAt ? moment(openedAt).fromNow() : null), [openedAt])

  return (
    <TouchableOpacity style={styles.recipeItem} onPress={onSelect}>
      <View style={styles.recipeItemContent}>
        <Image
          source={{
            uri: thumbnailUrl,
          }}
          style={styles.recipeImage}
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{title}</Text>
          {formattedTime ? <Text style={styles.recipeDate}>{formattedTime}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function RecipePicker({ navigation }) {
  const [searchQuery, setSearchQuery] = useState(null)
  const searchInputRef = useRef(null)

  const handleFocusSearch = useCallback(() => setSearchQuery(''), [])
  const handleResetSearch = useCallback(() => {
    setSearchQuery(null)
    searchInputRef.current?.blur()
  }, [])

  // Let's load it directly from the API (hook) and not from the store,
  // Because this these results should not react to updated or be cached.
  const { recipes: searchResults, loading: searchResultsLoading } = useUserRecipesSearch({
    query: searchQuery,
  })

  const { recentlyOpenedStore } = useStore()

  useEffect(() => {
    recentlyOpenedStore.ensureLoadedMetadata()
  }, [])

  const handleRecipeSelect = recipe => {
    console.log('[RecipePicker] Selected recipe:', recipe)

    DeviceEventEmitter.emit('event.selectedRecipe', recipe)
    navigation.goBack()
  }

  const handleNoRecipeSelect = () => {
    DeviceEventEmitter.emit('event.selectedRecipe', null)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name='magnify' size={20} color={theme.colors.softBlack} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder='Search my recipes'
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleFocusSearch}
          selectionColor={theme.colors.primary}
          autoCapitalize='none'
        />
        {searchQuery !== null ? (
          <TouchableOpacity onPress={handleResetSearch}>
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
          {searchQuery !== null ? (
            <View style={styles.subtitleContainer}>
              <MaterialCommunityIcons name='magnify' size={16} color={theme.colors.softBlack} />
              <Text style={styles.subtitleText}>Search Results</Text>
            </View>
          ) : (
            <View style={styles.subtitleContainer}>
              <MaterialCommunityIcons name='history' size={16} color={theme.colors.softBlack} />
              <Text style={styles.subtitleText}>Recently opened</Text>
            </View>
          )}
        </Text>

        {searchQuery !== null ? (
          searchResultsLoading ? (
            <Loading />
          ) : (
            <FlatList
              data={searchResults?.slice()}
              estimatedItemSize={100}
              renderItem={({ item }) => (
                <RecipeItem
                  thumbnailUrl={item?.['thumbnail-url']}
                  title={item.title}
                  openedAt={null}
                  onSelect={() => handleRecipeSelect(item)}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )
        ) : (
          <>
            {recentlyOpenedStore.mostRecentRecipesMetadata.length > 0 ? (
              <FlatList
                data={recentlyOpenedStore.mostRecentRecipesMetadata?.slice()}
                estimatedItemSize={100}
                renderItem={({ item }) => (
                  <RecipeItem
                    thumbnailUrl={item?.['thumbnail-url']}
                    title={item.title}
                    openedAt={item.openedAt}
                    onSelect={() => handleRecipeSelect(item)}
                  />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <Text style={styles.emptySearchText}>No recent recipes found. You can search to choose a recipe.</Text>
            )}
          </>
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
