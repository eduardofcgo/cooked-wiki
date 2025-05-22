import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { View, StyleSheet, Keyboard, Text, TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, withTiming, interpolate, useSharedValue } from 'react-native-reanimated'
import { theme } from '../../style/style'
import { TransparentButton } from '../core/Button'
import RecordCookCTA from '../core/RecordCookCTA'
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import DragIndicator from '../core/DragIndicator'
import { useStore } from '../../context/StoreContext'
import { observer } from 'mobx-react-lite'
import { useInAppNotification } from '../../context/NotificationContext'
import ActionToast from '../notification/ActionToast'
import { useFocusEffect } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

function RecipeDraftNotesCard({ recipeId, extractId, isVisible, isOnTopOfCookedCard, onClose }) {
  const navigation = useNavigation()
  const { showInAppNotification, clearInAppNotifications } = useInAppNotification()

  const { recipeCookedDraftStore } = useStore()
  const draft = recipeCookedDraftStore.getDraft(recipeId)

  const isDraftLoaded = draft !== undefined
  const showSheet = isVisible && isDraftLoaded

  const [sheetIndex, setSheetIndex] = useState(undefined)

  const id = recipeId || extractId

  const draftSavedToast = useCallback(() => {
    showInAppNotification(ActionToast, {
      props: { message: 'Draft saved' },
    })
  }, [showInAppNotification])

  useEffect(() => {
    recipeCookedDraftStore.ensureDraft(id)
  }, [id])

  useEffect(() => {
    if (isVisible === true) {
      clearInAppNotifications()
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible === false) {
      handleClose()

      if (draft?.notes?.length > 0) {
        draftSavedToast()
      }
    }
  }, [isVisible])

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isVisible === false && draft?.notes?.length > 0) {
          draftSavedToast()
        }
      }
    }, [draftSavedToast, draft?.notes]),
  )

  const bottomSheetRef = useRef(null)
  const textInputRef = useRef(null)

  const cookedCardOffset = isOnTopOfCookedCard ? 100 : 0
  const snapPoints = useMemo(() => [230 + cookedCardOffset, '100%'], [])
  const closedIndex = -1
  const startPointIndex = 0
  const expandedIndex = snapPoints.length - 1

  const expandedOpacity = useSharedValue(0)

  const handleClose = useCallback(() => {
    Keyboard.dismiss()
    bottomSheetRef.current?.close()

    onClose()
  }, [onClose])

  const minimizeSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(startPointIndex)
  }, [])

  useEffect(() => {
    if (sheetIndex >= expandedIndex) {
      textInputRef.current?.focus()
    } else {
      textInputRef.current?.blur()
    }

    if (sheetIndex === closedIndex) {
      // Pan gesture closed the sheet
      handleClose()
    }
  }, [sheetIndex])

  useEffect(() => {
    expandedOpacity.value = withTiming(sheetIndex >= expandedIndex ? 1 : 0, { duration: 500 })
  }, [sheetIndex])

  useEffect(() => {
    draft?.normalizeNotes()
  }, [draft, sheetIndex])

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: expandedOpacity.value,
  }))

  const onChangeTextInput = useCallback(
    text => {
      if (text) {
        draft.setNotes(text)
      }
    },
    [draft],
  )

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleHeader}>
        <View style={styles.dragIndicatorContainer}>
          <DragIndicator />
        </View>
      </View>
    ),
    [],
  )

  const navigateToRecordCook = useCallback(() => {
    handleClose()

    draft.normalizeNotes()

    setTimeout(() => {
      navigation.navigate('RecordCook', {
        recipeId,
        extractId,
        defaultNotes: draft?.notes,
      })
    }, 1)
  }, [handleClose, navigation, recipeId, extractId, draft?.notes])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={showSheet ? startPointIndex : closedIndex}
      enablePanDownToClose={false}
      handleComponent={renderHandle}
      backgroundStyle={styles.bottomSheetBackground}
      style={styles.bottomSheetShadow}
      onChange={setSheetIndex}
      enableBlurKeyboardOnGesture={true}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={[styles.inputContainer]}>
          {isDraftLoaded && (
            <View style={{ flex: 1 }}>
              <BottomSheetTextInput
                ref={textInputRef}
                cursorColor={theme.colors.primary}
                style={[styles.notesInput, sheetIndex >= expandedIndex ? { flex: 1 } : { flex: 0, maxHeight: 160 }]}
                multiline
                placeholderStyle={{ color: theme.colors.softBlack, opacity: 1 }}
                placeholder={
                  isOnTopOfCookedCard
                    ? 'Compare to the other Cooked bellow and create your new version.'
                    : 'Take notes while cooking.'
                }
                value={draft.notes}
                onChangeText={onChangeTextInput}
                autoFocus={false}
                keyboardType='default'
              />
              <Animated.View style={[styles.subtitleContainer, expandedStyle]}>
                <MaterialIcons name='edit-note' size={28} color={theme.colors.softBlack} />
                <Text style={styles.subtitle}>
                  Take notes with your changes while cooking.
                  {'\n'}
                  When finished, record it to your journal.
                </Text>
              </Animated.View>
            </View>
          )}

          <Animated.View style={[styles.modalButtons, expandedStyle]}>
            <TransparentButton title='Save draft' onPress={minimizeSheet} />
            <TouchableOpacity onPress={navigateToRecordCook}>
              <RecordCookCTA showIcon={false} showText={true} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'left',
    paddingBottom: 16,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'left',
    marginLeft: 8,
    marginRight: 32,
  },
  inputContainer: {
    marginBottom: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  handleHeader: {},
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.background,
  },
  bottomSheetShadow: {
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 12,
  },
  notesInput: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 15,
    minHeight: 160,
    textAlignVertical: 'top',
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
})

export default observer(RecipeDraftNotesCard)
