import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PrimaryButton, TransparentButton } from '../core/Button'
import Bounce from '../core/Bounce'
import { theme } from '../../style/style'

const ShareCook = ({ onShare, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Bounce trigger={true}>
          <Text style={styles.emoji}>🎉</Text>
        </Bounce>
        <Text style={styles.title}>Saved successfully!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>Let your friends know about this cook.</Text>
        <View style={styles.buttonGroup}>
          <PrimaryButton
            title='Share'
            onPress={onShare}
            icon={
              <MaterialCommunityIcons name='send' size={16} color={theme.colors.white} style={{ marginRight: 8 }} />
            }
          />
          <TransparentButton title='Dismiss' onPress={onClose} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    marginVertical: 16,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
})

export default ShareCook
