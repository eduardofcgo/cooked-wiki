import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../style/style'

const Notes = ({ notes, style }) => {
  if (!notes)
    return (
      <View style={[styles.notes, style]}>
        <Text style={styles.emptyNotesText}>Cooked without notes.</Text>
      </View>
    )

  return (
    <View style={[styles.notes, style]}>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notes: {
    paddingVertical: 16,
  },
  notesText: {
    fontSize: theme.fontSizes.default,
    lineHeight: 22,
    fontFamily: theme.fonts.ui,
    color: theme.colors.black,
  },
  emptyNotesText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    fontStyle: 'italic',
    color: theme.colors.softBlack,
  },
})

export default Notes
