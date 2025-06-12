import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../../style/style'
import SaveButton from './SaveButton'

function EditPreviewRecipeMenu({ onSaveRecipe, hasUnsavedChanges, isSavingRecipe, onClose }) {
  return (
    <View style={styles.menuBarContainer}>
      <View style={styles.menuBar}>
        <TouchableOpacity style={styles.menuButton} onPress={onClose}>
          <MaterialCommunityIcons name='close' size={22} color={theme.colors.softBlack} />
        </TouchableOpacity>

        {hasUnsavedChanges ? (
          <Text style={[styles.menuTitle, { color: theme.colors.black }]}>Unsaved Changes</Text>
        ) : (
          <Text style={styles.menuTitle}>Recipe Saved</Text>
        )}

        <SaveButton isLoading={isSavingRecipe} disabled={!hasUnsavedChanges} onPress={onSaveRecipe} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  menuBar: {
    flexGrow: 1,
    backgroundColor: theme.colors.secondary,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBarContainer: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginRight: 96, // Leave space for the toggle button (64px button + 16px margin + 16px padding)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  menuTitle: {
    textAlign: 'center',
    flex: 1,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
  },
})

export default EditPreviewRecipeMenu
