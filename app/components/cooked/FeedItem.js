import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'
import Card from './Card'

const FeedItem = ({ recipe, profileImage, username, date, notes, onPress, onSharePress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.recipeHeader} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.recipeHeaderContent}>
          <Text style={styles.recipeName}>Delicious Recipe</Text>
          <Feather name='chevron-right' size={20} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Card
        photoUri={
          'https://cooked.wiki/imgproxy/unsafe/resizing_type:fill/width:1080/height:1080/quality:75/NDE3MTZhNTMtMDY2ZS00MzcwLWIyZmQtOWI1MTg1ZDFhYzZkLzg2MmI2NzIxLWE3Y2QtNDAyZS1hYjQ2LTk1M2NjN2I5OTdiZg.jpg'
        }
        profileImage={'https://randomuser.me/api/portraits/women/43.jpg'}
        username={'chefmaria'}
        date={'01/01/2025'}
        showShareIcon={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  recipeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
  },
  recipeHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 18,
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
