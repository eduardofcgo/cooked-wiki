import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import debounce from 'lodash.debounce'

import { theme } from '../../style/style'
import { PrimaryButton } from '../../components/core/Button'
import { useAuth } from '../../context/AuthContext'
import { validateUsernameUrl, registerGoogleUsername } from '../../urls'
import { useStore } from '../../context/StoreContext'
import PhotoSelectionModal from '../../components/PhotoSelectionModal'
import ModalCard from '../../components/core/ModalCard'
import { getThumbnailUrl } from '../../urls'

export default function SetupUsername({ route }) {
  const { idToken, defaultImagePath } = route.params
  const auth = useAuth()

  const isMounted = useRef(true)

  const [username, setUsername] = useState('')
  const [profileImageUri, setProfileImageUri] = useState(defaultImagePath ? getThumbnailUrl(defaultImagePath) : null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isAvailable, setIsAvailable] = useState(null)
  const [showInvalidUsernameInfo, setShowInvalidUsernameInfo] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoModalVisible, setPhotoModalVisible] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [usernameInfoModalVisible, setUsernameInfoModalVisible] = useState(false)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const checkAvailability = useCallback(
    debounce(async nameToCheck => {
      if (!isMounted.current) return

      setIsValidating(true)
      setValidationMessage('')
      setIsAvailable(null)

      try {
        const response = await fetch(`${validateUsernameUrl()}?username=${encodeURIComponent(nameToCheck)}`)
        const data = await response.json()

        if (!isMounted.current) return

        if (data.code === 'VALID_USERNAME') {
          setIsAvailable(true)
          setShowInvalidUsernameInfo(false)
        } else if (data.code === 'INVALID_USERNAME') {
          setIsAvailable(false)
          setShowInvalidUsernameInfo(true)
        } else if (data.code === 'USERNAME_TAKEN') {
          setIsAvailable(false)
          setShowInvalidUsernameInfo(false)
        }

        setValidationMessage(data.message)
      } catch (error) {
        if (!isMounted.current) return
        console.error('Username availability check failed:', error)
        setIsAvailable(false)
        setValidationMessage('Error checking username. Please try again.')
      } finally {
        if (isMounted.current) {
          setIsValidating(false)
        }
      }
    }, 500),
    [],
  )

  const handleUsernameChange = text => {
    const cleanedText = text.toLowerCase()
    setUsername(cleanedText)

    if (cleanedText.length >= 3) {
      setIsValidating(true)
      setValidationMessage('Checking username...')
      setIsAvailable(null)
      checkAvailability(cleanedText)
    } else {
      setValidationMessage('')
      setIsAvailable(null)
      setIsValidating(false)
    }
  }

  // Image handling
  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setPhotoModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `profile_${Date.now()}.jpg`,
        type: result.assets[0].mimeType || 'image/jpeg',
      }

      setProfileImageUri(result.assets[0].uri)
      setProfileImageFile(file)
      setIsUploading(false)
    }
  }

  const handleGalleryPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need gallery permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setPhotoModalVisible(false)
      setIsUploading(true)

      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `profile_${Date.now()}.jpg`,
        type: result.assets[0].mimeType || 'image/jpeg',
      }

      setProfileImageUri(result.assets[0].uri)
      setProfileImageFile(file)
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (isAvailable !== true) {
      Alert.alert('Invalid Username', validationMessage || 'Please choose a valid and available username.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('id-token', idToken)

      if (profileImageFile) {
        formData.append('profile-image', profileImageFile)
      }

      const response = await fetch(registerGoogleUsername(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      })
      const data = await response.json()

      console.log('data', data)

      if (response.ok) {
        await auth.googleLogin(username, idToken)
      } else {
        throw new Error(data.message || 'Registration failed.')
      }
    } catch (error) {
      console.error('SetupUsername submission failed:', error)
      Alert.alert('Registration Error', error.message || 'An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled = isSubmitting || isValidating || isAvailable !== true

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
      {isSubmitting && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={styles.loadingText}>Setting up your account...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} pointerEvents={isSubmitting ? 'none' : 'auto'}>
        <View style={[styles.container, isSubmitting && styles.containerBlurred]}>
          <Text style={styles.title}>Almost there!</Text>
          <Text style={styles.subtitle}>Choose your username and profile picture.</Text>

          {/* Profile Picture Section */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={() => setPhotoModalVisible(true)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size='small' color={theme.colors.primary} />
            ) : profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name='camera' size={40} color={theme.colors.softBlack} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <MaterialCommunityIcons name='pencil' size={18} color={theme.colors.white} />
            </View>
          </TouchableOpacity>

          {/* Username Input Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your friends will find you by your username</Text>
            <TextInput
              style={[
                styles.input,
                validationMessage && isAvailable === false && styles.inputError,
                isAvailable === true && styles.inputSuccess,
              ]}
              placeholder='Choose a username'
              placeholderTextColor={theme.colors.grey}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize='none'
              autoCorrect={false}
              maxLength={20}
            />

            <View style={styles.validationContainer}>
              <View style={styles.validationIconContainer}>
                {isValidating ? (
                  <ActivityIndicator size='small' color={theme.colors.primary} />
                ) : isAvailable === true ? (
                  <MaterialCommunityIcons name='check' size={20} color={theme.colors.primary} />
                ) : isAvailable === false ? (
                  <MaterialCommunityIcons name='close' size={20} color={theme.colors.softBlack} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.validationText,
                  isAvailable === true && styles.validationSuccess,
                  isAvailable === false && styles.validationError,
                ]}
              >
                {validationMessage}
              </Text>
              {showInvalidUsernameInfo && (
                <TouchableOpacity onPress={() => setUsernameInfoModalVisible(true)} style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name='information-outline' size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <PrimaryButton
            title={isSubmitting ? 'Setting up...' : 'Complete Setup'}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>

      <PhotoSelectionModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />

      <ModalCard
        visible={usernameInfoModalVisible}
        onClose={() => setUsernameInfoModalVisible(false)}
        title='Username Requirements'
      >
        <View style={styles.usernameInfoContainer}>
          <View style={styles.usernameInfoItem}>
            <MaterialCommunityIcons name='check-circle' size={18} color={theme.colors.primary} />
            <Text style={styles.usernameInfoText}>Must start with a letter or digit.</Text>
          </View>
          <View style={styles.usernameInfoItem}>
            <MaterialCommunityIcons name='check-circle' size={18} color={theme.colors.primary} />
            <Text style={styles.usernameInfoText}>
              Can contain only letters (A-z), digits (0-9), underscores (_), dots (.), or hyphens (-).
            </Text>
          </View>
          <View style={styles.usernameInfoItem}>
            <MaterialCommunityIcons name='check-circle' size={18} color={theme.colors.primary} />
            <Text style={styles.usernameInfoText}>Must contain between 4 and 16 letters or digits.</Text>
          </View>
          <View style={styles.usernameInfoItem}>
            <MaterialCommunityIcons name='check-circle' size={18} color={theme.colors.primary} />
            <Text style={styles.usernameInfoText}>Must end with either a letter, digit, or underscore.</Text>
          </View>
        </View>
      </ModalCard>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  containerBlurred: {
    opacity: 0.7,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.body,
    color: theme.colors.softBlack,
    marginBottom: 30,
    textAlign: 'center',
  },
  imagePicker: {
    marginBottom: 30,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
    borderColor: theme.colors.softBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 5,
    fontSize: theme.fontSizes.small,
    color: theme.colors.grey,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.body,
    color: theme.colors.softBlack,
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.body,
    color: theme.colors.black,
    width: '100%',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputSuccess: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  validationContainer: {
    minHeight: 30,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  validationText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.body,
    flex: 1,
  },
  validationSuccess: {
    color: theme.colors.success,
  },
  validationError: {
    color: theme.colors.danger,
  },
  submitButton: {
    width: '100%',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.7,
  },
  infoIconContainer: {
    marginLeft: 8,
    padding: 2,
  },
  usernameInfoContainer: {
    paddingVertical: 10,
  },
  usernameInfoTitle: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 15,
  },
  usernameInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usernameInfoText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.body,
    color: theme.colors.softBlack,
    marginLeft: 10,
    flex: 1,
  },
  fullScreenLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
  },
})
