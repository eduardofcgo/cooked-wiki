import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, SecondaryButton, TransparentButton } from '../core/Button'
import ModalCard from '../core/ModalCard'
import ActionToast from '../notification/ActionToast'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../context/StoreContext'
import { useAuth } from '../../context/AuthContext'
import { useInAppNotification } from '../../context/NotificationContext'

function EditBio({ visible, onClose }) {
  const { showInAppNotification } = useInAppNotification()
  const inputRef = useRef(null)

  const { credentials } = useAuth()
  const { profileStore } = useStore()

  const bio = profileStore.getBio(credentials.username)

  const [editingBio, setEditingBio] = useState(bio)

  const handleLayout = useCallback(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible])

  const onSave = async () => {
    Keyboard.dismiss()
    onClose()

    try {
      await profileStore.updateBio(credentials.username, editingBio)

      showInAppNotification(ActionToast, {
        props: { message: 'Bio updated' },
        resetQueue: true,
      })
    } catch (error) {
      showInAppNotification(ActionToast, {
        props: { message: 'Failed to update bio', success: false },
        resetQueue: true,
      })
    }
  }

  const handleClose = () => {
    Keyboard.dismiss()
    onClose()
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleClose}
      disableContentUpdateAnimation={true}
      titleComponent={
        <View style={styles.titleContainer}>
          <Text style={styles.modalTitle}>Update bio</Text>
        </View>
      }
    >
      <TextInput
        ref={inputRef}
        cursorColor={theme.colors.primary}
        style={[styles.bioInput]}
        multiline={true}
        placeholder='Tell about yourself and what you love to cook.'
        defaultValue={bio}
        autoFocus={false}
        onLayout={handleLayout}
        keyboardType='default'
        maxLength={150}
        onChangeText={setEditingBio}
      />

      <View style={styles.modalButtons}>
        <PrimaryButton title='Save' onPress={onSave} />
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
    height: 70,
    textAlignVertical: 'top',
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    marginBottom: 20,
  },
  socialsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  socialsTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 5,
  },
  socialInputContainer: {
    gap: 5,
  },
  socialLabel: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.gray,
  },
  socialInput: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 12,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default observer(EditBio)
