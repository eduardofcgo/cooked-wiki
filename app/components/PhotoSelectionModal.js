import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { theme } from '../style/style'
import ModalCard from './core/ModalCard'
import PermissionsDenied from './PermissionsDenied'
import { observer } from 'mobx-react-lite'

function PhotoSelectionModal({ visible, onClose, onCameraPress, onGalleryPress }) {
  const [failedPermissions, setFailedPermissions] = useState(false)

  const handleClose = useCallback(() => {
    setFailedPermissions(false)
    onClose()
  }, [onClose])

  // When the user navigates back from settings after enabling permissions,
  // close the modal/reset the state to allow him to restart the flow.
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (visible) {
          handleClose()
        }
      }
    }, [visible, handleClose]),
  )

  const handleCameraPress = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setFailedPermissions(true)

      return
    }

    onCameraPress()
  }, [onCameraPress])

  const handleGalleryPress = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setFailedPermissions(true)

      return
    }

    onGalleryPress()
  }, [onGalleryPress])

  return (
    <ModalCard
      visible={visible}
      onClose={handleClose}
      title={failedPermissions ? null : 'Add photo'}
      disableContentUpdateAnimation={failedPermissions}
    >
      {failedPermissions ? (
        <PermissionsDenied
          onDismiss={handleClose}
          customMessage='Please enable gallery or camera permissions in your device settings.'
        />
      ) : (
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.optionButton} onPress={handleCameraPress}>
            <MaterialCommunityIcons name='camera' size={24} color={theme.colors.softBlack} />
            <Text style={styles.optionText}>Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleGalleryPress}>
            <MaterialCommunityIcons name='image' size={24} color={theme.colors.softBlack} />
            <Text style={styles.optionText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
})

export default observer(PhotoSelectionModal)
