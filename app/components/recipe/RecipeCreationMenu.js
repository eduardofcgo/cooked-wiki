import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'

function RecipeCreationMenu({ onLinkPress, onTextPress, onFilePress, onVoicePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.optionButton} onPress={onLinkPress}>
          <MaterialCommunityIcons name='link' size={20} color={theme.colors.softBlack} />
          <Text style={styles.optionText}>From link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onTextPress}>
          <MaterialCommunityIcons name='content-paste' size={20} color={theme.colors.softBlack} />
          <Text style={styles.optionText}>Paste text</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.optionButton} onPress={onFilePress}>
          <MaterialCommunityIcons name='image' size={20} color={theme.colors.softBlack} />
          <Text style={styles.optionText}>From file or photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onVoicePress}>
          <MaterialCommunityIcons name='microphone' size={20} color={theme.colors.softBlack} />
          <Text style={styles.optionText}>Voice</Text>
        </TouchableOpacity>
      </View>

      {/* <TouchableOpacity style={styles.optionButton} onPress={onScratchPress}>
        <MaterialCommunityIcons name='pencil' size={20} color={theme.colors.softBlack} />
        <Text style={styles.optionText}>From scratch</Text>
      </TouchableOpacity> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 4,
  },
  optionSubtext: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
  },
})

export default observer(RecipeCreationMenu)
