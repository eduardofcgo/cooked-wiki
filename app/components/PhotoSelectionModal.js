import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../style/style'
import ModalCard from './ModalCard'

export default function PhotoSelectionModal({ visible, onClose, onCameraPress, onGalleryPress }) {
  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      title="Add photo"
    >
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={onCameraPress}
        >
          <MaterialCommunityIcons 
            name="camera" 
            size={32} 
            color={theme.colors.primary} 
          />
          <Text style={styles.optionText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={onGalleryPress}
        >
          <MaterialCommunityIcons 
            name="image" 
            size={32} 
            color={theme.colors.primary} 
          />
          <Text style={styles.optionText}>Open Gallery</Text>
        </TouchableOpacity>
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionButton: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    marginTop: 16,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
})