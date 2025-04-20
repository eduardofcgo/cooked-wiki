import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'

const MAX_LINES = 2

const Notes = ({ notes, style, goToCooked, goToRecipe }) => {
  if (!notes)
    return (
      <TouchableOpacity onPress={goToRecipe}>
        <Text style={[styles.readMoreText, { paddingBottom: 16 }]}>Read more</Text>
      </TouchableOpacity>
    )

  return (
    <TouchableOpacity onPress={goToCooked}>
      <View style={[styles.notes, style]}>
        <Text style={styles.notesText} numberOfLines={MAX_LINES}>
          {notes}
        </Text>
        <Text style={styles.readMoreText}>Read more</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  notes: {},
  notesText: {
    fontSize: theme.fontSizes.default,
    lineHeight: 22,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
  },
  readMoreText: {
    color: theme.colors.primary,
    marginTop: 4,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
  },
})

export default Notes
