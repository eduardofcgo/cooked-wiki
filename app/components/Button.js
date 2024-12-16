import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { theme } from '../style/style'

export function PrimaryButton({ onPress, title, style }) {
  return (
    <Button onPress={onPress} title={title} style={[styles.button, { backgroundColor: theme.colors.primary }, style]} />
  )
}

export function SecondaryButton({ onPress, title, style }) {
  return (
    <Button onPress={onPress} style={[styles.button, styles.secondaryButton, style]}>
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>{title}</Text>
    </Button>
  )
}

export function Button({ onPress, title, style, children }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {title ? <Text style={[styles.buttonText]}>{title}</Text> : children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.softBlack,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
  },
  secondaryButtonText: {
    color: theme.colors.softBlack,
  },
})
