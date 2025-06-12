import React from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../../style/style'

function ToggleEditPreviewButton({ isPreviewMode, isLoadingPreview, onToggle }) {
  return (
    <TouchableOpacity
      style={[
        styles.menuBarNavigateButton,
        isPreviewMode && {
          backgroundColor: theme.colors.softBlack,
        },
      ]}
      onPress={onToggle}
    >
      {isLoadingPreview ? (
        <ActivityIndicator size='small' color={theme.colors.softBlack} />
      ) : (
        <MaterialCommunityIcons
          name='eye-outline'
          size={21}
          color={isPreviewMode ? theme.colors.secondary : theme.colors.softBlack}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  menuBarNavigateButton: {
    width: 64,
    flexGrow: 0,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ToggleEditPreviewButton
