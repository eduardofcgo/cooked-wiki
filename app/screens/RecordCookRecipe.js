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
  const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false)
  const [pendingNavAction, setPendingNavAction] = useState(null)

  const handleBackPress = () => {
    setIsDiscardModalVisible(true)
    return true
  }

  useEffect(() => {
    const beforeRemoveHandler = e => {
      e.preventDefault()
      setPendingNavAction(e.data.action)
      setIsDiscardModalVisible(true)
    }

    navigation.addListener('beforeRemove', beforeRemoveHandler)

    return () => {
      navigation.removeListener('beforeRemove', beforeRemoveHandler)
    }
  }, [navigation])

  const handleDiscard = () => {
    setIsDiscardModalVisible(false)
    if (pendingNavAction) {
      navigation.dispatch(pendingNavAction)
      setPendingNavAction(null)
    } else {
      navigation.goBack()
    }
  }

  return (
    <>
      <FadeInStatusBar color={theme.colors.secondary} />
      <RecordCook editMode={true} route={route} navigation={navigation} />

      <ModalCard
        visible={isDiscardModalVisible}
        onClose={() => setIsDiscardModalVisible(false)}
        titleComponent={
          <View style={{ flex: 1, gap: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Bounce trigger={isDiscardModalVisible} delay={0}>
              <MaterialCommunityIcons name='alert-circle' size={40} color={theme.colors.primary} />
            </Bounce>
            <Text style={styles.modalTitle}>Discard changes?</Text>
          </View>
        }
      >
        <Text style={styles.modalText}>You have unsaved changes. Are you sure you want to go back?</Text>
        <View style={styles.modalButtons}>
          <SecondaryButton title='Discard' onPress={handleDiscard} />
          <TransparentButton title='Cancel' onPress={() => setIsDiscardModalVisible(false)} />
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
