import React, { useEffect, useState, useCallback } from 'react'
import { Alert, StyleSheet, View, Text, Animated } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Bounce from '../components/core/Bounce'

import RecordCook from '../components/recordcook/RecordCook'
import ModalCard from '../components/core/ModalCard'
import { PrimaryButton, TransparentButton } from '../components/core/Button'
import { theme } from '../style/style'
import { useInAppNotification } from '../context/NotificationContext'

import { observer } from 'mobx-react-lite'

function EditCook({ navigation }) {
  const { showInAppNotification } = useInAppNotification()

  const [hasChanges, setHasChanges] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(true)
  const [pendingNavigationEvent, setPendingNavigationEvent] = useState(null)

  const handleDiscard = useCallback(() => {
    setShowDiscardModal(false)
    if (pendingNavigationEvent) {
      navigation.dispatch(pendingNavigationEvent.data.action)
    }
  }, [navigation, pendingNavigationEvent])

  const handleSaved = useCallback(() => {
    setShowDiscardModal(false)
    setHasChanges(false)
    setPendingNavigationEvent(null)

    setTimeout(() => {
      navigation.goBack()

      showInAppNotification(ActionToast, {
        props: { message: 'Cook updated' },
        resetQueue: true,
      })
    }, 0)
  }, [navigation])

  const handleDeleteConfirm = useCallback(() => {
    setShowDeleteModal(false)
    setHasChanges(false)
    setPendingNavigationEvent(null)

    setTimeout(() => {
      navigation.goBack()

      showInAppNotification(ActionToast, {
        props: { message: 'Cook deleted' },
        resetQueue: true,
      })
    }, 0)
  }, [navigation])

  const toggleDiscardModal = useCallback(value => {
    setShowDiscardModal(value ?? false)
  }, [])

  const toggleDeleteModal = useCallback(value => {
    setShowDeleteModal(value ?? false)
  }, [])

  const handleOpenDeleteModal = useCallback(() => {
    toggleDeleteModal(true)
  }, [toggleDeleteModal])

  const handleCloseDiscardModal = useCallback(() => {
    toggleDiscardModal(false)
  }, [toggleDiscardModal])

  const handleCloseDeleteModal = useCallback(() => {
    toggleDeleteModal(false)
  }, [toggleDeleteModal])

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
      <RecordCook
        editMode={true}
        hasChanges={hasChanges}
        setHasChanges={setHasChanges}
        onSaved={handleSaved}
        onDelete={handleOpenDeleteModal}
      />

      <ModalCard
        visible={showDiscardModal}
        onClose={handleCloseDiscardModal}
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
          <PrimaryButton title='Discard' onPress={handleDiscard} />
          <TransparentButton title='Cancel' onPress={handleCloseDiscardModal} />
        </View>
      </ModalCard>

      <ModalCard
        visible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        titleComponent={
          <View style={{ flex: 1, gap: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Bounce delay={0}>
              <MaterialCommunityIcons name='trash-can' size={40} color={theme.colors.primary} />
            </Bounce>
            <Text style={styles.modalTitle}>Delete cook?</Text>
          </View>
        }
      >
        <Text style={styles.modalText}>This action cannot be undone. Are you sure you want to delete this cook?</Text>
        <View style={styles.modalButtons}>
          <PrimaryButton title='Delete' onPress={handleDeleteConfirm} />
          <TransparentButton title='Cancel' onPress={handleCloseDeleteModal} />
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
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
})

export default observer(EditCook)
