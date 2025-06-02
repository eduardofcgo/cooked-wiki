import React, { useCallback } from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../style/style'
import { PrimaryButton, TransparentButton } from './core/Button'
import { observer } from 'mobx-react-lite'

function PermissionsDenied({ onDismiss, customMessage }) {
  const openSettings = useCallback(() => {
    Linking.openSettings()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name='shield-alert' size={30} color={theme.colors.primary} />
        <Text style={styles.title}>Permissions Required</Text>
      </View>

      <Text style={styles.message}>{customMessage || 'Please enable permissions in your device settings.'}</Text>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          onPress={openSettings}
          title={'Settings'}
          icon={<MaterialCommunityIcons name='cog' size={16} color={theme.colors.white} />}
        />
        <TransparentButton title='Dismiss' onPress={onDismiss} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
})

export default observer(PermissionsDenied)
