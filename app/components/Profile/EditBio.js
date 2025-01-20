import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { theme } from '../../style/style'
import { SecondaryButton, TransparentButton } from '../Button'
import ModalCard from '../ModalCard'

export default function EditBio({ visible, onClose, onSave, initialBio }) {
  const [bio, setBio] = useState(initialBio || '')

  const handleSave = () => {
    onSave(bio)
  }

  const handleClose = () => {
    onClose()
    setBio(initialBio || '')
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleClose}
      titleComponent={
        <View style={styles.titleContainer}>
          <Text style={styles.modalTitle}>Edit bio</Text>
        </View>
      }
    >
      <TextInput
        cursorColor={theme.colors.primary}
        style={styles.bioInput}
        multiline
        placeholder='Tell us about yourself and what you love to cook?'
        value={bio}
        onChangeText={setBio}
        autoFocus={false}
        keyboardType='default'
        maxLength={150}
      />
      <View style={styles.modalButtons}>
        <SecondaryButton title='Save' onPress={handleSave} />
        <TransparentButton title='Cancel' onPress={handleClose} />
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  bioInput: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 15,
    height: 150,
    textAlignVertical: 'top',
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
