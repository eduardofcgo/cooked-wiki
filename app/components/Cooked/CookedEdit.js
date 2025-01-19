import React, { useCallback, memo, useState } from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'

import { useStore } from '../../context/store/StoreContext'
import { getPhotoUrl } from '../../urls'

import { theme } from '../../style/style'

import Loading from '../Loading'
import { PrimaryButton, SecondaryButton, Button } from '../Button'
import ImageUploadButton from '../ImageUploadButton'
import PhotoSelectionModal from '../PhotoSelectionModal'

const EditableImage = memo(({ path, index, onExclude }) => (
  <View style={[styles.imageContainer, styles.imageContainerEditing]}>
    <Image
      source={{ uri: getPhotoUrl(path) }}
      style={[styles.mainImage, { width: 110, height: 110, borderRadius: theme.borderRadius.default }]}
    />
    <SecondaryButton title='Exclude' onPress={() => onExclude(index)} style={styles.excludeButton} />
  </View>
))

export default function CookedEdit({ post, close }) {
  const { profileStore } = useStore()

  const [notes, setNotes] = useState(post.notes)
  const [photos, setPhotos] = useState(post['cooked-photos-path'] || [])
  const [isUploading, setIsUploading] = useState(false)
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false)

  const handleSave = useCallback(() => {
    profileStore.updateProfileCooked(post.username, post.id, notes, photos)
    close()
  }, [post, notes, photos, close])

  const handleExcludeImage = useCallback(
    index => {
      const updatedPhotos = photos.filter((_, i) => i !== index)
      setPhotos(updatedPhotos)
    },
    [post],
  )

  const handleNotesChange = useCallback(
    text => {
      setNotes(text)
    },
    [post],
  )

  const handleAddImage = useCallback(() => {
    setIsPhotoModalVisible(true)
  }, [])

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setIsUploading(true)
      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: result.assets[0].mimeType,
      }
      const imagePath = await profileStore.uploadProfileCookedPhoto(post.id, file)
      setIsUploading(false)
      setPhotos(prevPhotos => [...prevPhotos, imagePath])
    }
    setIsPhotoModalVisible(false)
  }

  const handleGalleryPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Sorry, we need gallery permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setIsUploading(true)
      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: result.assets[0].mimeType,
      }
      const imagePath = await profileStore.uploadProfileCookedPhoto(post.id, file)
      setIsUploading(false)
      setPhotos(prevPhotos => [...prevPhotos, imagePath])
    }
    setIsPhotoModalVisible(false)
  }

  return (
    <View style={styles.modalContainer}>
      <ScrollView horizontal style={styles.imageScrollView} contentContainerStyle={styles.imageScrollEditContent}>
        {photos?.map((path, index) => (
          <EditableImage key={index} path={path} index={index} onExclude={handleExcludeImage} />
        ))}
        {(!photos || photos?.length < 2) && (
          <View style={[styles.imageContainer, styles.imageContainerEditing]}>
            <ImageUploadButton onPress={handleAddImage} isUploading={isUploading} hasImage={false} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.editContainer, { height: 240 }]}>
        <TextInput multiline value={notes} onChangeText={handleNotesChange} style={styles.editInput} />
      </View>

      <View style={styles.actionsContainer}>
        <PrimaryButton onPress={handleSave} title='Save' />
        <SecondaryButton onPress={close} title='Cancel' />
      </View>

      <PhotoSelectionModal
        visible={isPhotoModalVisible}
        onClose={() => setIsPhotoModalVisible(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.secondary,
  },
  imageScrollView: {
    flexGrow: 0,
  },
  imageScrollEditContent: {
    marginLeft: 15,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  imageContainerEditing: {
    marginRight: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainImage: {
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  excludeButton: {
    position: 'absolute',
    top: '40%',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    backgroundColor: theme.colors.secondary,
  },
  editInput: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    borderWidth: 1,
    borderColor: theme.colors.softBlack,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
    borderTopWidth: 0,
    borderTopColor: theme.colors.secondary,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
})
