import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'
import Card from './Card'

const RecipeHeader = ({ cooked, rounded }) => {
  const recipeId = cooked['recipe-id']
  const extractId = cooked['extract-id']

  const hasRecipe = Boolean(recipeId || extractId)
  const recipeTitle = cooked['recipe-title'] || cooked['extract-title'] || cooked['title']

  const navigation = useNavigation()

  const navigateToRecipe = useCallback(() => {
    navigation.push('Recipe', { recipeId, extractId })
  }, [navigation, recipeId, extractId])

  return hasRecipe ? (
    <TouchableOpacity
      style={[styles.recipeHeader, rounded && { borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}
      onPress={navigateToRecipe}
      activeOpacity={0.7}
    >
      <View style={styles.recipeHeaderContent}>
        <Text style={styles.recipeName}>{recipeTitle}</Text>
        <Feather name='chevron-right' size={20} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  ) : (
    <View style={styles.recipeHeader}>
      <Text style={styles.recipeName}>{recipeTitle}</Text>
    </View>
  )
}

const FeedItem = ({ cooked, rounded, showRecipe = true, collapseNotes = true, showCookedWithoutNotes = true }) => {
  return (
    <View style={styles.container}>
      {showRecipe && <RecipeHeader cooked={cooked} rounded={rounded} />}

      <Card
        cooked={cooked}
        showShareIcon={true}
        relativeDate={true}
        photoSlider={true}
        collapseNotes={collapseNotes}
        roundedTop={!showRecipe && rounded}
        showRecipe={showRecipe}
        roundedBottom={rounded}
        bodyBackgroundColor={theme.colors.white}
        showCookedWithoutNotes={showCookedWithoutNotes}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  recipeHeader: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  recipeHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeName: {
    fontSize: theme.fontSizes.default,
    fontWeight: '600',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    flex: 1,
  },
  tapHint: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 4,
    fontFamily: theme.fonts.body,
  },
})

export default FeedItem
