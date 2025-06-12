import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import SaveButton from './SaveButton'
import { theme } from '../../../style/style'

function EditTextRecipeMenu({
  onSaveRecipe,
  hasUnsavedChanges,
  isSavingRecipe,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClose,
}) {
  return (
    <View style={styles.menuBarContainer}>
      <View style={styles.menuBar}>
        <View style={styles.leftButtons}>
          <TouchableOpacity style={[styles.menuButton, { minWidth: 60 }]} onPress={onClose}>
            <MaterialCommunityIcons name='close' size={22} color={theme.colors.softBlack} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} disabled={!canUndo} onPress={onUndo}>
            <MaterialCommunityIcons
              name='undo'
              size={18}
              color={theme.colors.softBlack}
              style={{ opacity: canUndo ? 1 : theme.opacity.disabled }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} disabled={!canRedo} onPress={onRedo}>
            <MaterialCommunityIcons
              name='redo'
              size={18}
              color={theme.colors.softBlack}
              style={{ opacity: canRedo ? 1 : theme.opacity.disabled }}
            />
          </TouchableOpacity>
        </View>

        <View>
          <SaveButton isLoading={isSavingRecipe} disabled={!hasUnsavedChanges} onPress={onSaveRecipe} />
        </View>
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
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rightButtons: {
    paddingHorizontal: 16,
  },
})

export default EditTextRecipeMenu
