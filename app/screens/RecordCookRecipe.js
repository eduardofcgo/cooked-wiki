import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, Text, Animated } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Bounce from '../components/Bounce'

import RecordCook from '../components/RecordCook/RecordCook'
import FadeInStatusBar from '../components/FadeInStatusBar'
import ModalCard from '../components/ModalCard'
import { PrimaryButton, SecondaryButton, TransparentButton } from '../components/Button'
import { theme } from '../style/style'

export default function RecordCookRecipe({ route, navigation }) {
  const [hasChanges, setHasChanges] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [pendingNavigationEvent, setPendingNavigationEvent] = useState(null)

  const handleDiscard = () => {
    setShowDiscardModal(false)
    if (pendingNavigationEvent) {
      navigation.dispatch(pendingNavigationEvent.data.action)
    }
  }

  const handleSaved = () => {
    setShowDiscardModal(false)
    setHasChanges(false)
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!hasChanges) {
        return
      }

      e.preventDefault()
      setPendingNavigationEvent(e)
      setShowDiscardModal(true)
    })

    return unsubscribe
  }, [navigation, hasChanges])

  return (
    <>
      <FadeInStatusBar color={theme.colors.secondary} />
      <RecordCook
        editMode={true}
        route={route}
        navigation={navigation}
        hasChanges={hasChanges}
        setHasChanges={setHasChanges}
        onSaved={handleSaved}
      />

      <ModalCard
        visible={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        titleComponent={
          <View style={{ flex: 1, gap: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Bounce delay={0}>
              <MaterialCommunityIcons name='alert-circle' size={40} color={theme.colors.primary} />
            </Bounce>
            <Text style={styles.modalTitle}>Discard changes?</Text>
          </View>
        }
      >
        <Text style={styles.modalText}>You have unsaved changes. Are you sure you want to go back?</Text>
        <View style={styles.modalButtons}>
          <SecondaryButton title='Discard' onPress={handleDiscard} />
          <TransparentButton title='Cancel' onPress={() => setShowDiscardModal(false)} />
        </View>
      </ModalCard>
    </>
  )
}

const styles = StyleSheet.create({
  modalText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  discardButton: {
    backgroundColor: theme.colors.error,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
})
