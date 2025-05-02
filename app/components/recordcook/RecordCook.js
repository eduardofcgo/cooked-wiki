import React, { useState, useCallback, useEffect, useContext, useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  Animated,
  DeviceEventEmitter,
  StatusBar,
  Share,
} from 'react-native'
import moment from 'moment'
import { theme } from '../../style/style'
import { PrimaryButton, SecondaryButton, TransparentButton } from '../core/Button'
import ImageUploadButton from '../ImageUploadButton'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { getCookedPhotoUrl } from '../../urls'
import { useStore } from '../../context/StoreContext'
import PhotoSelectionModal from '../PhotoSelectionModal'
import Loading from '../core/Loading'
import ConfirmationModal from './ConfirmationModal'
import RecordCookIntro from './RecordCookIntro'
import Step from './Step'
import { useAuth } from '../../context/AuthContext'
import NotesModal from './NotesModal'
import { useNavigation, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'

const EditableImage = ({ path, index, onExclude }) => {
  return (
    <View style={[styles.imageContainer, styles.imageContainerEditing]}>
      <Image
        source={{ uri: getCookedPhotoUrl(path) }}
        style={[styles.mainImage, { width: 110, height: 110, borderRadius: theme.borderRadius.default }]}
      />
      <SecondaryButton title='Exclude' onPress={() => onExclude(index)} style={styles.excludeButton} />
    </View>
  )
}

const SelectedRecipe = observer(({ recipe, onPress }) => {
  return (
    <TouchableOpacity style={styles.selectedRecipeContainer} onPress={onPress}>
      <View style={styles.selectedRecipeContent}>
        {recipe === null ? (
          <>
            <MaterialCommunityIcons
              name='chef-hat'
              size={24}
              color={theme.colors.softBlack}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={styles.selectedRecipeName}>Cooked without a recipe</Text>
              <Text style={styles.selectedRecipeSubtitle}>Freestyle cooking</Text>
            </View>
          </>
        ) : (
          <>
            <Image
              source={{
                uri: recipe?.['thumbnail-url'],
              }}
              style={styles.selectedRecipeImage}
            />
            <View style={styles.selectedRecipeInfo}>
              <Text style={styles.selectedRecipeName}>{recipe.title}</Text>
            </View>
          </>
        )}
      </View>
      <MaterialCommunityIcons name='pencil' size={15} color={theme.colors.softBlack} />
    </TouchableOpacity>
  )
})

const NotesPreview = observer(({ notes, onPress, editMode }) => (
  <TouchableOpacity style={[styles.selectedRecipeContainer, editMode && { height: 110 }]} onPress={onPress}>
    <View style={[styles.selectedRecipeContent, editMode && { height: 110 }]}>
      {notes && notes.length > 0 ? (
        <Text style={styles.notesPreview} numberOfLines={editMode ? 4 : 2}>
          {notes}
        </Text>
      ) : (
        <Text
          style={[styles.notesPreview, { color: theme.colors.softBlack, fontSize: theme.fontSizes.small }]}
          numberOfLines={editMode ? 4 : 2}
        >
          Empty notes
        </Text>
      )}
    </View>
    <MaterialCommunityIcons name='pencil' size={15} color={theme.colors.softBlack} />
  </TouchableOpacity>
))

function RecordCook({ editMode, hasChanges, setHasChanges, onSaved, onDelete, preSelectedRecipe }) {
  const navigation = useNavigation()
  const route = useRoute()

  console.log('[RecordCook] Route:', route)

  const { credentials } = useAuth()
  const loggedInUsername = credentials?.username
  const { profileStore, recentlyOpenedStore } = useStore()

  console.log('[RecordCook] Preselected recipe:', preSelectedRecipe)

  useEffect(() => {
    recentlyOpenedStore.ensureLoadedMetadata()
  }, [])

  const photoOptional = useMemo(() => {
    return Boolean(preSelectedRecipe)
  }, [preSelectedRecipe])

  const [loadingCooked, setLoadingCooked] = useState(true)

  const [isUploading, setIsUploading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(preSelectedRecipe)
  const [notes, setNotes] = useState(undefined)
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false)
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false)
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false)
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)

  const stepTwoActive = editMode || photos.length > 0
  const stepThreeActive = editMode || (stepTwoActive && selectedRecipe !== undefined) || preSelectedRecipe
  const stepFourActive = editMode || (stepThreeActive && notes !== undefined)

  const saveChanges = useCallback(() => {
    profileStore.updateProfileCooked(loggedInUsername, route.params?.cookedId, notes, photos)
    setHasChanges(false)
    onSaved()
  }, [loggedInUsername, route.params?.cookedId, notes, photos, profileStore, setHasChanges, onSaved])

  useEffect(() => {
    ;(async () => {
      if (editMode) {
        const cooked = await profileStore.getCooked(loggedInUsername, route.params?.cookedId)
        setNotes(cooked.notes)
        setPhotos(cooked['cooked-photos-path'] || [])
      }

      setLoadingCooked(false)
    })()
  }, [editMode])

  useEffect(() => {
    const onSelectedRecipe = DeviceEventEmitter.addListener('event.selectedRecipe', recipe => {
      setSelectedRecipe(recipe)
    })

    return () => {
      onSelectedRecipe.remove()
    }
  }, [])

  // useEffect(() => {
  //   if (editMode) {
  //     navigation.setOptions({
  //       title: 'Tomato Pasta',
  //     })
  //   }
  // }, [editMode, navigation])

  const handleExcludeImage = useCallback(index => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)

    if (setHasChanges) {
      setHasChanges(true)
    }
  }, [photos, setHasChanges])

  const handleAddImage = useCallback(() => {
    setIsPhotoModalVisible(true)
  }, [])

  const handleCameraPress = useCallback(async () => {
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
      setIsPhotoModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: result.assets[0].mimeType,
      }
      const imagePath = await profileStore.uploadProfileCookedPhoto('freestyle-cook', file)
      setIsUploading(false)
      setPhotos(prevPhotos => [...prevPhotos, imagePath])
    }
  }, [profileStore, setIsUploading, setPhotos])

  const handleGalleryPress = useCallback(async () => {
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
      setIsPhotoModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: result.assets[0].mimeType,
      }
      const imagePath = await profileStore.uploadProfileCookedPhoto('freestyle-cook', file)
      setIsUploading(false)
      setPhotos(prevPhotos => [...prevPhotos, imagePath])

      if (setHasChanges) {
        setHasChanges(true)
      }
    }
    setIsPhotoModalVisible(false)
  }, [profileStore, setIsUploading, setPhotos, setHasChanges])

  const handleNotesSave = useCallback(newNotes => {
    setNotes(newNotes)
    setIsNotesModalVisible(false)

    if (setHasChanges) {
      setHasChanges(true)
    }    
  }, [setHasChanges])

  const handleNotesClose = useCallback(newNotes => {
    if (!newNotes || (newNotes.trim && newNotes.trim().length === 0)) {
      setNotes(null)
    }
    setIsNotesModalVisible(false)
  }, [])

  if (loadingCooked) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mainContent}>
          {!editMode && <RecordCookIntro />}

          <Step
            number='1'
            text={photoOptional ? 'Select a photo (optional)' : 'Select a photo'}
            isActive={true}
            isFilled={stepTwoActive}
            editMode={editMode}
          >
            <View style={styles.photoSection}>
              {photos?.map((path, index) => (
                <EditableImage key={index} path={path} index={index} onExclude={handleExcludeImage} />
              ))}

              {photos?.length < 2 && (
                <View style={[styles.imageContainer, styles.imageContainerEditing]}>
                  <ImageUploadButton onPress={handleAddImage} isUploading={isUploading} hasImage={false} />
                </View>
              )}
            </View>
          </Step>

          {photos.length === 0 && !preSelectedRecipe && (
            <Text style={styles.description}>
              Cooking without a recipe? No problem, you can still add it to your journal.
            </Text>
          )}

          {!editMode && !preSelectedRecipe && (
            <Step number='2' text='What did you make?' isActive={stepTwoActive} isFilled={stepThreeActive}>
              <View style={styles.buttonContainer}>
                {selectedRecipe !== undefined ? (
                  <SelectedRecipe
                    recipe={selectedRecipe}
                    onClear={() => setSelectedRecipe(undefined)}
                    onPress={() => navigation.navigate('RecipePicker')}
                  />
                ) : (
                  <PrimaryButton
                    title={photoOptional ? 'Select recipe' : 'Add recipe'}
                    onPress={() => navigation.navigate('RecipePicker')}
                    style={[
                      styles.shareButton,
                      !stepTwoActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 },
                      styles.selectRecipeButton,
                    ]}
                    disabled={!stepTwoActive}
                  />
                )}
              </View>
            </Step>
          )}

          <Step
            number={preSelectedRecipe ? '2' : '3'}
            text='Add your notes'
            isActive={stepThreeActive}
            isFilled={stepFourActive}
            editMode={editMode}
          >
            <View style={styles.buttonContainer}>
              {notes !== undefined ? (
                <NotesPreview notes={notes} onPress={() => setIsNotesModalVisible(true)} editMode={editMode} />
              ) : (
                <PrimaryButton
                  title='Add notes'
                  onPress={() => setIsNotesModalVisible(true)}
                  style={[
                    styles.shareButton,
                    !stepThreeActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 },
                    styles.addNotesButton,
                  ]}
                  disabled={!stepThreeActive}
                  icon={<MaterialCommunityIcons name='pencil' size={16} color={theme.colors.white} />}
                />
              )}
            </View>
          </Step>

          {!editMode ? (
            <Step
              number={preSelectedRecipe ? '3' : '4'}
              text='All set!'
              isActive={stepFourActive}
              isFilled={false}
              style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12 }]}
            >
              <PrimaryButton
                title='Add to journal'
                onPress={() => {
                  setIsConfirmationModalVisible(true)
                }}
                style={[!stepFourActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 }]}
                disabled={!stepFourActive}
              />
            </Step>
          ) : (
            <View style={{ flex: 1, gap: 16, alignItems: 'center', width: '100%' }}>
              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', width: '100%' }}>
                {hasChanges ? <PrimaryButton title='Save changes' onPress={saveChanges} /> : <View></View>}

                <TransparentButton title='Delete' onPress={onDelete} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <PhotoSelectionModal
        visible={isPhotoModalVisible}
        onClose={() => setIsPhotoModalVisible(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />

      <ConfirmationModal
        visible={isConfirmationModalVisible}
        onClose={() => {
          setIsConfirmationModalVisible(false)
        }}
        onConfirm={() => {
          setIsConfirmationModalVisible(false)

          navigation.replace('Cooked', {
            showShareModal: true,
            cookedId: 'b3da3f5e-211e-4940-a29d-ac2f2754418d',
            startPosition: 0,
            preloadedCooked: {
              'cooked-photos-path': photos,
              notes: notes,
              'recipe-id': selectedRecipe?.recipeId,
              'extract-id': selectedRecipe?.extractId,
            },
          })
        }}
      />

      <NotesModal
        visible={isNotesModalVisible}
        onClose={handleNotesClose}
        onSave={handleNotesSave}
        initialNotes={notes}
        recipe={selectedRecipe}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 32,
  },
  descriptionBelow: {
    paddingBottom: 100,
  },
  photoSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoButton: {
    width: 110,
    height: 110,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  photoButtonContent: {
    alignItems: 'center',
    gap: 16,
  },
  photoButtonText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  imageContainerEditing: {
    marginRight: 15,
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
  inputSection: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    marginBottom: 8,
  },
  recipeInput: {
    width: '100%',
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputPlaceholder: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
  },
  buttonContainer: {},
  shareButton: {
    width: '100%',
    height: 40,
  },
  photoButtonWithImage: {
    backgroundColor: theme.colors.background,
  },
  photoButtonTextWithImage: {
    color: theme.colors.softBlack,
  },
  shareButtonDisabled: {
    opacity: 0.33,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    fontWeight: 'bold',
  },
  stepNumberTextInactive: {
    color: theme.colors.black,
  },
  stepText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    fontWeight: '500',
  },
  stepWrapper: {
    width: '100%',
    flex: 1,
  },
  stepContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  stepContentInner: {
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  inactiveStep: {
    opacity: 0.5,
  },
  recipeInputInactive: {
    shadowOpacity: 0,
    elevation: 0,
  },
  selectRecipeButton: {
    marginBottom: 24,
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
  cancelButton: {
    backgroundColor: theme.colors.background,
  },
  addNotesButton: {
    marginBottom: 10,
  },
  notesPreview: {
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: theme.borderRadius.default,
    opacity: theme.opacity.disabled,
    marginTop: 10,
  },
  notesPreviewText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  selectedRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: theme.borderRadius.default,
    height: 70,
  },
  selectedRecipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 70,
  },
  selectedRecipeImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.default,
    marginRight: 12,
  },
  selectedRecipeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  notesPreview: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    marginBottom: 4,
  },
  selectedRecipeName: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    marginBottom: 4,
  },
  selectedRecipeSubtitle: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
  },
  confirmationText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    lineHeight: 24,
    marginBottom: 16,
  },
  confirmationPoints: {
    marginBottom: 16,
    paddingTop: 16,
  },
  confirmationPoint: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    flex: 1,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  stepNumberFilled: {
    backgroundColor: theme.colors.softBlack,
  },
  stepNumberTextFilled: {
    color: theme.colors.background,
  },
})

export default observer(RecordCook)
