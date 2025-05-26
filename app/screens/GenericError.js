import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View } from 'react-native'
import { theme } from '../style/style'

const errorMessages = {
  400: 'Bad request.',
  401: 'Not authorized.',
  403: 'Access forbidden.',
  404: 'Not found.',
  408: 'Request timeout.',
  429: 'Too many requests.',
  500: 'Internal server error.',
  502: 'Bad gateway.',
  503: 'Service unavailable.',
  504: 'Gateway timeout.',
}

const getErrorMessage = status => {
  return errorMessages[status] || 'Something went wrong.'
}

export default function GenericError({ status, onRetry, style, customMessage }) {
  const errorMessage = customMessage || getErrorMessage(status)

  return (
    <SafeAreaView
      style={{
        ...styles.container,
        ...style,
      }}
    >
      <View style={styles.content}>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorMessage: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  },
})
