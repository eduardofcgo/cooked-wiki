import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, FlatList, TextInput, ScrollView, Animated, DeviceEventEmitter } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { theme } from '../style/style'
import { PrimaryButton, SecondaryButton, Button } from '../components/Button'
import ImageUploadButton from '../components/ImageUploadButton'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import { getPhotoUrl } from '../urls'
import { useStore } from '../context/store/StoreContext'
import PhotoSelectionModal from '../components/PhotoSelectionModal'
import ModalCard from '../components/ModalCard'

const StepIndicator = ({ number, text, isActive }) => (
  <View style={styles.stepContainer}>
    <View style={[
      styles.stepNumber,
      !isActive && styles.stepNumberInactive
    ]}>
      <Text style={[
        styles.stepNumberText,
        !isActive && styles.stepNumberTextInactive
      ]}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
)

const Step = ({ number, text, isActive, children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current // Start 50 units below

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [isActive])

  if (!isActive) return null;
  
  return (
    <Animated.View 
      style={[
        styles.stepWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <StepIndicator number={number} text={text} isActive={isActive} />
      <View style={styles.stepContent}>
        {children}
      </View>
    </Animated.View>
  )
}

const EditableImage = ({ path, index, onExclude }) => (
  <View style={[styles.imageContainer, styles.imageContainerEditing]}>
    <Image
      source={{ uri: getPhotoUrl(path) }}
      style={[styles.mainImage, { width: 110, height: 110, borderRadius: theme.borderRadius.default }]}
    />
    <SecondaryButton title='Exclude' onPress={() => onExclude(index)} style={styles.excludeButton} />
  </View>
)

const recentRecipes = [
  { id: '1', name: 'Spaghetti Carbonara', lastCooked: '2 days ago' },
  { id: '2', name: 'Chicken Curry', lastCooked: '1 week ago' },
  { id: '3', name: 'Beef Stir Fry', lastCooked: '2 weeks ago' },
]

const SelectedRecipe = ({ recipe, onClear }) => (
  <View style={styles.selectedRecipeContainer}>
    <View style={styles.selectedRecipeContent}>
      <Text style={styles.selectedRecipeName}>{recipe.name}</Text>
    </View>
    <TouchableOpacity onPress={onClear}>
      <FontAwesomeIcon icon={faXmark} size={15} color={theme.colors.primary} />
    </TouchableOpacity>
  </View>
)

const NotesPreview = ({ notes, onPress }) => (
  <TouchableOpacity 
    style={styles.selectedRecipeContainer} 
    onPress={onPress}
  >
    <View style={styles.selectedRecipeContent}>
      <Text 
        style={styles.selectedRecipeName} 
        numberOfLines={2}
      >
        {notes}
      </Text>
    </View>
    <MaterialCommunityIcons 
        name="pencil" 
        size={15} 
        color={theme.colors.primary} 
      />
  </TouchableOpacity>
)

export default function RecordCook({ navigation, route }) {
  const { profileStore } = useStore()

  const [isUploading, setIsUploading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(undefined)
  const [notes, setNotes] = useState(undefined)
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false)
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false)

  const stepTwoActive = photos.length > 0
  const stepThreeActive = stepTwoActive && selectedRecipe !== undefined
  const stepFourActive = stepThreeActive && notes !== undefined

  useEffect(() => {
    const onSelectedRecipe = DeviceEventEmitter.addListener("event.selectedRecipe", recipe => {
      setSelectedRecipe(recipe)
    })

    return () => {
      onSelectedRecipe.remove()
    }
  }, [])

  const handleExcludeImage = index => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
  }

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
    setIsPhotoModalVisible(false)
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Don't reset the state here
      }
    }, [])
  )

  const NotesModal = ({ visible, onClose, onSave, initialNotes }) => {
    const inputRef = useRef(null);

    // const handleModalShow = () => {
    //   const focusTimeout = setTimeout(() => {
    //     inputRef.current?.focus();
    //     inputRef.current?.setNativeProps({ selection: { start: 0, end: 0 } });
    //   }, 300);

    //   return () => clearTimeout(focusTimeout);
    // };

    return (
      <ModalCard
        visible={visible}
        onClose={onClose}
        // onShow={handleModalShow}
        title="Add notes"
      >
        <TextInput
          ref={inputRef}
          style={styles.notesInput}
          multiline
          placeholder="What did you cook and how did it turn out?"
          value={initialNotes || ''}
          onChangeText={setNotes}
          keyboardType="default"
          autoFocus={false}
        />
        <View style={styles.modalButtons}>
          <PrimaryButton title="Save" onPress={onSave} />
          <SecondaryButton title="Cancel" onPress={onClose} />
        </View>
      </ModalCard>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mainContent}>
          
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, styles.titleHighlight]}>Cook</Text>
              <Text style={styles.title}>ed something new?</Text>
            </View>
            <Text style={styles.description}>
                If you are cooking without a recipe, you can still share your creation with friends.
            </Text>
          </View>
          
          <Step number="1" text="Select a photo of your dish" isActive={true}>
            <View style={styles.photoSection}>
              {photos?.map((path, index) => (
                <EditableImage key={index} path={path} index={index} onExclude={handleExcludeImage} />
              ))}

              {(photos?.length < 2) && (
                <View style={[styles.imageContainer, styles.imageContainerEditing]}>
                  <ImageUploadButton 
                    onPress={handleAddImage} 
                    isUploading={isUploading}
                    hasImage={false}
                  />
                </View>
              )}
            </View>
          </Step>

          <Step number="2" text="What did you make?" isActive={stepTwoActive}>
            <View style={styles.buttonContainer}>
              {selectedRecipe ? (
                <SelectedRecipe 
                  recipe={selectedRecipe} 
                  onClear={() => setSelectedRecipe(undefined)}
                />
              ) : (
                <PrimaryButton 
                  title="Select recipe" 
                  onPress={() => navigation.navigate('RecipeSearch')}
                  style={[
                    styles.shareButton,
                    !stepTwoActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 },
                    styles.selectRecipeButton
                  ]}
                  disabled={!stepTwoActive}
                  icon={<MaterialCommunityIcons 
                    name="chef-hat" 
                    size={16} 
                    color={theme.colors.white} 
                  />}
                />
              )}
            </View>
          </Step>

          <Step number="3" text="Add your notes" isActive={stepThreeActive}>
            <View style={styles.buttonContainer}>
              {notes ? (
                <NotesPreview 
                  notes={notes} 
                  onPress={() => setIsNotesModalVisible(true)} 
                />
              ) : (
                <PrimaryButton 
                  title="Add notes" 
                  onPress={() => setIsNotesModalVisible(true)}
                  style={[
                    styles.shareButton,
                    !stepThreeActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 },
                    styles.addNotesButton
                  ]}
                  disabled={!stepThreeActive}
                  icon={<MaterialCommunityIcons 
                    name="pencil" 
                    size={16} 
                    color={theme.colors.white} 
                  />}
                />
              )}
            </View>

            <NotesModal
              visible={isNotesModalVisible}
              onClose={() => setIsNotesModalVisible(false)}
              onSave={() => {
                setIsNotesModalVisible(false)
              }}
              initialNotes={notes}
            />
          </Step>

          <Step number="4" text="Add to your journal" isActive={stepFourActive}>
            <View style={styles.buttonContainer}>
              <PrimaryButton 
                title="Add to journal" 
                onPress={() => {
                  // Handle adding to journal with notes
                  console.log('Adding to journal with notes:', notes)
                }}
                style={[
                  styles.shareButton,
                  !stepFourActive && { backgroundColor: theme.colors.softBlack, opacity: 0.33 }
                ]}
                disabled={!stepFourActive}
                icon={<MaterialCommunityIcons 
                  name="notebook" 
                  size={16} 
                  color={theme.colors.white} 
                />}
              />
            </View>
          </Step>
        </View>
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  mainContent: {
    alignItems: 'center',
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
  },
  descriptionBelow: {
    paddingBottom: 100,
  },
  photoSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  buttonContainer: {
    width: '100%',
  },
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  stepContent: {
    width: '100%',
  },
  inactiveStep: {
    opacity: 0.5,
  },
  recipeInputInactive: {
    shadowOpacity: 0,
    elevation: 0,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
  titleHighlight: {
    color: theme.colors.primary,
  },
  stepNumberInactive: {
    backgroundColor: theme.colors.softBlack,
    opacity: 0.33,
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
    gap: 10,
  },
  addNotesButton: {
    marginBottom: 10,
  },
  notesPreview: {
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: theme.borderRadius.default,
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
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.borderRadius.default,
    marginBottom: 24,
  },
  selectedRecipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedRecipeName: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
  },
})

