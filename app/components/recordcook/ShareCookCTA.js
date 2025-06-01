import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PrimaryButton, TransparentButton } from '../core/Button'
import Bounce from '../core/Bounce'
import { theme } from '../../style/style'

const ShareNewCookCTA = ({ onSharePress, onDismissPress }) => {
  return (
    <View style={styles.content}>
      <View style={styles.titleContainer}>
        <Bounce delay={2000} loop={true}>
          <Text style={styles.emoji}>🎉</Text>
        </Bounce>
        <Text style={styles.title}>Saved successfully!</Text>
      </View>
      <Text style={styles.message}>Share to let your friends know about this cook.</Text>
      <View style={styles.buttonGroup}>
        <PrimaryButton
          title='Share'
          onPress={onSharePress}
          icon={<MaterialCommunityIcons name='send' size={16} color={theme.colors.white} style={{ marginRight: 8 }} />}
        />
        <TransparentButton title='Dismiss' onPress={onDismissPress} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
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
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
})

export default ShareNewCookCTA
