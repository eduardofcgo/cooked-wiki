import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'

const MAX_LINES = 2

const Notes = ({ notes, style, onPress }) => {
  if (!notes) return null

  const [textTruncated, setTextTruncated] = useState(false)

  const onTextLayout = e => {
    const { nativeEvent } = e
    if (nativeEvent.lines.length > MAX_LINES) {
      setTextTruncated(true)
    }
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.notes, style]}>
        <Text style={styles.notesText} numberOfLines={MAX_LINES} onTextLayout={onTextLayout}>
          {notes}
        </Text>
        {textTruncated && <Text style={styles.readMoreText}>Read more</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  notes: {
    // We'll add any specific styles here as needed
  },
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
