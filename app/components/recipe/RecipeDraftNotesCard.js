import React, { useState, useRef, useCallback, useMemo } from 'react'
import { View, StyleSheet, Keyboard } from 'react-native'
import { theme } from '../../style/style'
import { TransparentButton } from '../core/Button'
import RecordCookCTA from '../core/RecordCookCTA'
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import DragIndicator from '../core/DragIndicator'

export default function RecipeDraftNotesCard({ isVisible, initialNotes, onClose }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const bottomSheetRef = useRef(null)
  const textInputRef = useRef(null)

  const snapPoints = useMemo(() => [300, '100%'], [])
  const closedIndex = -1
  const startPointIndex = 0
  const expandedIndex = snapPoints.length - 1

  const handleClose = useCallback(() => {
    Keyboard.dismiss()
    bottomSheetRef.current?.close()

    onClose()
  }, [onClose])

  const handleSheetChange = useCallback(index => {
    if (index === expandedIndex) {
      textInputRef.current?.focus()
    } else if (index === closedIndex) {
      // Pan gesture closed the sheet
      handleClose()
    }
  }, [])

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

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={!isVisible ? closedIndex : startPointIndex}
      enablePanDownToClose={true}
      handleComponent={renderHandle}
      backgroundStyle={styles.bottomSheetBackground}
      style={styles.bottomSheetShadow}
      onChange={handleSheetChange}
      enableBlurKeyboardOnGesture={true}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={[styles.inputContainer]}>
          <BottomSheetTextInput
            ref={textInputRef}
            cursorColor={theme.colors.primary}
            style={[styles.notesInput]}
            multiline
            placeholderStyle={{ color: theme.colors.softBlack, opacity: 1 }}
            placeholder='Take notes while cooking. When finished, you can record them to your journal.'
            value={notes}
            onChangeText={setNotes}
            autoFocus={false}
            keyboardType='default'
          />
        </View>
        <View style={styles.modalButtons}>
          <TransparentButton title='Save draft' onPress={handleClose} />
          <RecordCookCTA showIcon={false} showText={true} />
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
  inputContainer: {
    marginBottom: 20,
  },
  handleHeader: {
    paddingVertical: 8,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 8,
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
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
