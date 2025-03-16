import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'
import SocialMenu from './SocialMenu'

const FeedItem = ({ recipe, profileImage, username, date, notes, onPress, onSharePress }) => {
  // Extract data with fallbacks
  const {
    name = 'Delicious Recipe',
    imageUrl = 'https://cooked.wiki/imgproxy/unsafe/resizing_type:fill/width:1080/height:1080/quality:75/NDE3MTZhNTMtMDY2ZS00MzcwLWIyZmQtOWI1MTg1ZDFhYzZkLzg2MmI2NzIxLWE3Y2QtNDAyZS1hYjQ2LTk1M2NjN2I5OTdiZg.jpg',
    notesPreview = notes ? notes.substring(0, 120) + (notes.length > 120 ? '...' : '') : '',
  } = recipe || {}

  return (
    <View style={styles.container}>
      {/* Recipe name at the top */}
      <TouchableOpacity style={styles.recipeHeader} onPress={onPress}>
        <Text style={styles.recipeName}>{name}</Text>
      </TouchableOpacity>

      {/* Recipe image */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: imageUrl }} style={styles.recipeImage} resizeMode='contain' />
      </TouchableOpacity>

      {/* Social menu bar (reusing our component) */}
      <SocialMenu
        profileImage={profileImage}
        username={username}
        date={date}
        showExpandIcon={false}
        showShareIcon={true}
        onActionPress={onSharePress}
      />

      {/* Notes preview */}
      {notesPreview ? (
        <TouchableOpacity style={styles.notesPreview} onPress={onPress}>
          <Text style={styles.notesText} numberOfLines={3}>
            {notesPreview}
          </Text>
          {notes && notes.length > 120 && <Text style={styles.readMore}>Read more</Text>}
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  recipeImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  notesPreview: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.black,
  },
  readMore: {
    marginTop: 8,
    color: theme.colors.primary,
    fontWeight: '500',
  },
})

export default FeedItem
