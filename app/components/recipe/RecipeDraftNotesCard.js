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
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

function RecipeDraftNotesCard({ recipeId, extractId, isVisible, isOnTopOfCookedCard, onClose }) {
  const navigation = useNavigation()
  const { showInAppNotification, clearInAppNotifications } = useInAppNotification()

  const id = recipeId || extractId

  const { recipeCookedDraftStore } = useStore()
  const draft = recipeCookedDraftStore.getDraft(id)

  const isDraftLoaded = draft !== undefined
  const showSheet = isVisible && isDraftLoaded

  const [sheetIndex, setSheetIndex] = useState(undefined)

  const draftSavedToast = useCallback(() => {
    showInAppNotification(ActionToast, {
      props: { message: 'Draft saved' },
    })
  }, [showInAppNotification])

  useEffect(() => {
    recipeCookedDraftStore.ensureDraft(id)
  }, [id])

  useFocusEffect(
    useCallback(() => {
      // When going back to the screen, set the default card position again
      if (isVisible) {
        bottomSheetRef?.current?.snapToIndex(0)
      }

      return () => {
        // When leaving the screen, show the toast
        if (isVisible && draft?.notes?.length > 0) {
          draftSavedToast()
        }
      }
    }, [draftSavedToast, draft?.notes, isVisible]),
  )

  const bottomSheetRef = useRef(null)

  const cookedCardOffset = isOnTopOfCookedCard ? 100 : 0

  // Create granular snap points for smooth positioning (every 25px from min to max)
  const snapPoints = useMemo(() => {
    const minHeight = 150 + cookedCardOffset
    const maxHeight = 800 // Adjust this based on your needs
    const increment = 25 // Every 25px

    const points = []
    for (let height = minHeight; height <= maxHeight; height += increment) {
      points.push(height)
    }
    // Add percentage-based points for larger screens
    points.push('60%', '75%', '90%', '100%')

    return points
  }, [cookedCardOffset])

  const closedIndex = -1
  const startPointIndex = 0

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close()

    // Sometimes sheets does not seem to update index on pan gesture down
    setSheetIndex(closedIndex)

    onClose()
  }, [onClose])

  useEffect(() => {
    // Let the parent comoponent control the sheet via isVisible prop
    if (!isVisible) {
      bottomSheetRef.current?.close()
    }
  }, [isVisible])

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
      index={showSheet ? startPointIndex : closedIndex}
      enablePanDownToClose={true}
      handleComponent={renderHandle}
      backgroundStyle={styles.bottomSheetBackground}
      style={styles.bottomSheetShadow}
      onChange={setSheetIndex}
      onClose={handleClose}
      enableBlurKeyboardOnGesture={false}
      enableDynamicSizing={false}
      enableOverDrag={false}
      animateOnMount={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={[styles.notesContainer]}>
          {isDraftLoaded && (
            <TouchableOpacity
              style={[styles.notes]}
              onPress={() => {
                navigation.navigate('EditDraftNotes', {
                  recipeId,
                  extractId,
                  cookedCardOffset,
                })
              }}
            >
              <MaterialCommunityIcons
                name='pencil'
                size={15}
                color={theme.colors.softBlack}
                backgroundColor={theme.colors.secondary}
                style={styles.pencilIcon}
              />
              {draft.notes?.length > 0 ? (
                <Text style={styles.notesText}>{draft.notes}</Text>
              ) : isOnTopOfCookedCard ? (
                <Text style={[styles.notesText, { color: theme.colors.softBlack }]}>Take notes while cooking.</Text>
              ) : (
                <Text style={[styles.notesText, { color: theme.colors.softBlack }]}>Take notes while cooking.</Text>
              )}
            </TouchableOpacity>
          )}
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
  notesContainer: {
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
  notes: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 15,
    height: 'auto',
    minHeight: 85,
    textAlignVertical: 'top',
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    position: 'relative',
  },
  notesText: {
    color: theme.colors.black,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    paddingRight: 32,
  },
  pencilIcon: {
    position: 'absolute',
    paddingLeft: 16,
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 16,
  },
})

export default observer(RecipeDraftNotesCard)
