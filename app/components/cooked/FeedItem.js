import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'
import Card from './Card'

const FeedItem = ({ cooked, onPress, onSharePress }) => {
  const recipeTitle = cooked['recipe-title'] || cooked['extract-title']

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.recipeHeader} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.recipeHeaderContent}>
          <Text style={styles.recipeName}>{recipeTitle}</Text>
          <Feather name='chevron-right' size={20} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Card cooked={cooked} showShareIcon={true} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  recipeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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
