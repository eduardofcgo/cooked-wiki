import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'

const FullNotes = ({ notes, style, showCookedWithoutNotes = true }) => {
  if (!notes) {
    if (showCookedWithoutNotes) {
      return (
        <View style={[styles.notes, style]}>
          <Text style={styles.emptyNotesText}>Cooked without notes.</Text>
        </View>
      )
    }
    return null
  }

  return (
    <View style={[styles.notes, style]}>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notes: {},
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
    paddingBottom: 16,
  },
})

export default observer(FullNotes)
