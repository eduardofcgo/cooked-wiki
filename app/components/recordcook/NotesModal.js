import React, { useState, useRef } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from '../core/Button'
import ModalCard from '../core/ModalCard'

export default function NotesModal({ visible, onClose, onSave, initialNotes, recipe }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const inputRef = useRef(null)

  const placeholder = recipe === null ? 'What did you cook and how did it turn out?' : 'How did it turn out?'

  const handleSave = () => {
    onSave(notes)
  }

  const handleClose = () => {
    onClose(notes)
    setNotes(initialNotes || '')
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleClose}
      titleComponent={
        <View style={{ flex: 1, gap: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Text style={styles.modalTitle}>Edit notes</Text>
          <Text style={styles.optionalText}>optional</Text>
        </View>
      }
    >
      <TextInput
        ref={inputRef}
        cursorColor={theme.colors.primary}
        style={styles.notesInput}
        multiline
        placeholderStyle={{ color: theme.colors.softBlack, opacity: 1 }}
        placeholder={placeholder}
        value={notes}
        onChangeText={setNotes}
        autoFocus={false}
        keyboardType='default'
      />
      <View style={styles.modalButtons}>
        <PrimaryButton title='Done' onPress={handleSave} />
        <TransparentButton title='Cancel' onPress={handleClose} />
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  optionalText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    paddingTop: 9,
  },
  notesInput: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 15,
    height: 300,
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
