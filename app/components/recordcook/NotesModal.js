import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableOpacity, Dimensions, Platform } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from '../core/Button'
import ModalCard from '../core/ModalCard'

const normalizeNotes = notes => {
  return notes
    ?.replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/(^|\n)-\s*/g, '\n- ')
    .trim()
}

export default function NotesModal({ visible, onClose, onSave, initialNotes, defaultNotes, recipe }) {
  const [notes, setNotes] = useState(initialNotes || defaultNotes || '')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const inputRef = useRef(null)

  const placeholder = recipe === null ? 'What did you cook and how did it turn out?' : 'How did it turn out?'

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      },
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  const calculateMaxHeight = () => {
    const screenHeight = Dimensions.get('window').height
    const modalHeaderHeight = 60 // Approximate height of modal header
    const buttonHeight = 50 // Approximate height of buttons
    const padding = 40 // Approximate padding/margins
    const availableHeight = screenHeight - keyboardHeight - modalHeaderHeight - buttonHeight - padding
    return Math.max(150, availableHeight * 0.8) // Ensure minimum height of 150
  }

  const handleLayout = useCallback(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible])

  const handleSave = () => {
    Keyboard.dismiss()
    onSave(normalizeNotes(notes))
  }

  const handleClose = () => {
    Keyboard.dismiss()
    onClose(notes)
    setNotes(initialNotes || '')
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleClose}
      disableContentUpdateAnimation={true}
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
        style={[styles.notesInput, { maxHeight: calculateMaxHeight() }]}
        multiline
        scrollEnabled={true}
        placeholderStyle={{ color: theme.colors.softBlack, opacity: 1 }}
        placeholder={placeholder}
        value={notes}
        onChangeText={setNotes}
        autoFocus={false}
        onLayout={handleLayout}
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
    minHeight: 150,
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
