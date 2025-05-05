import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { PrimaryButton } from '../core/Button'
import ModalCard from '../core/ModalCard'
import { theme } from '../../style/style'
import Bounce from '../core/Bounce'

export default function WarningModal({ visible, onClose }) {
  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      titleComponent={
        <View style={{ flex: 1, gap: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Bounce trigger={visible} delay={300}>
            <MaterialIcons name='warning' size={40} color={theme.colors.primary} />
          </Bounce>
          <Text style={styles.modalTitle}>Can't Save</Text>
        </View>
      }
    >
      <View style={styles.container}>
        <Text style={styles.message}>A cook without a recipe (freestyle cook) must have at least one photo.</Text>
        <PrimaryButton title='OK' onPress={onClose} style={styles.button} />
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
})
