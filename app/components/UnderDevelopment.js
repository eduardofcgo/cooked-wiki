import React, { useCallback } from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../style/style'
import { PrimaryButton, TransparentButton } from './core/Button'
import { observer } from 'mobx-react-lite'

function UnderDevelopment({ openURL, onClose }) {
  const openInBrowser = useCallback(() => {
    Linking.openURL(openURL)
  }, [openURL])

  return (
    <View style={styles.container}>
      {/* <Text style={styles.message}>
        Not yet supported on the App. You can use the site directly instead. Sorry for the inconvenience!
      </Text> */}

      <Text style={styles.message}>
        This feature is under development. Sorry for the inconvenience!
      </Text>

      <View style={styles.buttonsContainer}>
        {/* <PrimaryButton
          onPress={openInBrowser}
          title={'Open in Browser'}
          icon={<MaterialCommunityIcons name='open-in-new' size={16} color={theme.colors.white} />}
        /> */}

        {/* <TransparentButton title='Cancel' onPress={onClose} /> */}

        <TransparentButton title='Go back' onPress={onClose} />

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', // Ensure the container takes full width to space out buttons
  },
  button: {
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  buttonText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
})

export default observer(UnderDevelopment)
