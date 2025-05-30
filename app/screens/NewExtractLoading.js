import React, { useState, useEffect } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { theme } from '../style/style'

const loadingMessages = [
  'Generating recipe...',
  'Thank you for your patience.',
  'Verifying results, please wait a few more seconds.',
  'Using AI to double check your recipe.',
  'Almost there! Performing a final review.',
  'Will finish in the next 5 seconds.',
]

export default function NewExtractLoading() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size='large' />
        <Text
          style={{
            color: theme.colors.softBlack,
            fontFamily: theme.fonts.ui,
            marginTop: 20,
            textAlign: 'center',
            fontSize: theme.fontSizes.default,
            maxWidth: '80%',
          }}
        >
          {loadingMessages[currentMessageIndex]}
        </Text>
      </View>
    </View>
  )
}
