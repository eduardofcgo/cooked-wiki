import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { theme } from '../../style/style'

export function PrimaryButton({ onPress, title, style, icon }) {
  return (
    <Button
      onPress={onPress}
      style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }, style]}
    >
      {icon}
      <Text style={[styles.buttonText, styles.primaryButtonText]}>{title}</Text>
    </Button>
  )
}

export function SecondaryButton({ onPress, title, style, icon, ...props }) {
  return (
    <Button onPress={onPress} style={[styles.button, styles.secondaryButton, style]} {...props}>
      {icon}
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>{title}</Text>
    </Button>
  )
}

export function TransparentButton({ onPress, title, style, children }) {
  return (
    <SecondaryButton
      onPress={onPress}
      title={title}
      style={[style, { backgroundColor: 'transparent' }]}
      children={children}
    />
  )
}

export function Button({ onPress, title, style, loading, children }) {
  return (
    <TouchableOpacity
      style={[styles.button, style, loading && styles.loadingButton]}
      onPress={onPress}
      disabled={loading}
    >
      {children ? children : title ? <Text style={[styles.buttonText]}>{title}</Text> : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.softBlack,
    borderRadius: theme.borderRadius.small,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 64,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.uiBold,
  },
  secondaryButtonText: {
    color: theme.colors.softBlack,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {},
  loadingIndicator: {
    marginRight: 8,
  },
  loadingButton: {
    opacity: 0.7,
  },
})
