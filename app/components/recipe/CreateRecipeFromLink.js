import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from '../core/Button'
import { observer } from 'mobx-react-lite'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useFocusEffect } from '@react-navigation/native'

const isValidUrl = text => {
  const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/
  return urlPattern.test(text)
}

function CreateRecipeFromLink({ onClose, onGenerate }) {
  const inputRef = useRef(null)
  const appState = useRef(AppState.currentState)

  const [isImportingWithConfirmationDelay, setImportingWithConfirmationDelay] = useState(false)
  const [recipeUrl, setRecipeUrl] = useState('')
  const [urlError, setUrlError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const importRecipe = useCallback(
    url => {
      if (!url.trim()) {
        setUrlError(true)
        setErrorMessage('Please enter a URL')
      } else if (!isValidUrl(url)) {
        setUrlError(true)
        setErrorMessage('Please enter a valid URL')
      } else {
        setImportingWithConfirmationDelay(true)
      }
    },
    [onClose],
  )

  const tryPaste = useCallback(async () => {
    try {
      const hasString = await Clipboard.hasStringAsync()
      if (hasString) {
        const clipboardContent = await Clipboard.getStringAsync()
        if (clipboardContent) {
          // Even is the pasted url is not valid, still set it so the user
          // has the option to fix it.
          setRecipeUrl(clipboardContent)
          importRecipe(clipboardContent)
        }
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error)
    }
  }, [setRecipeUrl, importRecipe])

  useEffect(() => {
    if (isImportingWithConfirmationDelay) {
      setTimeout(() => {
        setRecipeUrl('')
        Keyboard.dismiss()
        setImportingWithConfirmationDelay(false)

        onGenerate(recipeUrl)
      }, 1000)
    }
  }, [isImportingWithConfirmationDelay])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const openingForeground = appState.current.match(/inactive|background/) && nextAppState === 'active'
      if (openingForeground) {
        tryPaste()
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [tryPaste])

  useFocusEffect(
    useCallback(() => {
      tryPaste()
    }, [tryPaste]),
  )

  useEffect(() => {
    tryPaste()
  }, [])

  const handleInputFocus = useCallback(() => {
    tryPaste()
  }, [tryPaste])

  const handleUrlChange = useCallback(
    text => {
      setRecipeUrl(text)

      if (urlError) {
        setUrlError(false)
        setErrorMessage('')
      }
    },
    [urlError],
  )

  const handleCancel = () => {
    Keyboard.dismiss()
    setRecipeUrl('')
    setUrlError(false)
    setErrorMessage('')
    onClose()
  }

  return (
    <View>
      <Text style={styles.description}>Paste a URL from any recipe website or app.</Text>

      <View>
        <View style={[styles.urlInputContainer, urlError && styles.urlInputError]}>
          <TextInput
            ref={inputRef}
            cursorColor={theme.colors.primary}
            style={[styles.urlInput, isImportingWithConfirmationDelay && styles.disabledInput]}
            placeholder='https://example.com/recipe'
            value={recipeUrl}
            autoFocus={true}
            keyboardType='url'
            autoCapitalize='none'
            autoCorrect={false}
            onChangeText={handleUrlChange}
            onFocus={handleInputFocus}
            editable={!isImportingWithConfirmationDelay}
          />
          {recipeUrl && !isImportingWithConfirmationDelay ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setRecipeUrl('')
                if (urlError) {
                  setUrlError(false)
                  setErrorMessage('')
                }
              }}
            >
              <Icon name='close' size={20} color={theme.colors.softBlack} />
            </TouchableOpacity>
          ) : !isImportingWithConfirmationDelay ? (
            <TouchableOpacity style={styles.pasteButton} onPress={tryPaste}>
              <Icon name='content-paste' size={20} color={theme.colors.softBlack} />
            </TouchableOpacity>
          ) : null}
          {isImportingWithConfirmationDelay && (
            <ActivityIndicator style={styles.loadingSpinner} size='small' color={theme.colors.primary} />
          )}
        </View>
        {urlError && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>

      <View style={styles.modalButtons}>
        <PrimaryButton
          title='Generate'
          onPress={() => importRecipe(recipeUrl)}
          disabled={isImportingWithConfirmationDelay}
        />
        <TransparentButton title='Cancel' onPress={handleCancel} disabled={isImportingWithConfirmationDelay} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    marginBottom: 15,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  urlInput: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 15,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    marginBottom: 0,
    borderWidth: 0,
    color: theme.colors.black,
  },
  disabledInput: {
    opacity: theme.opacity.disabled,
  },
  clearButton: {
    padding: 10,
    marginRight: 5,
  },
  pasteButton: {
    padding: 10,
    marginRight: 5,
  },
  urlInputError: {
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    marginBottom: 12,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  loadingSpinner: {
    marginRight: 15,
  },
})

export default observer(CreateRecipeFromLink)
