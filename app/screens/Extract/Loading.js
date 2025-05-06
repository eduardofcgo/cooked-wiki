import React, { useState, useEffect } from 'react'
import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native'
import { theme } from '../../style/style'

export default function Loading({ style }) {
  const loadingMessages = [
    'Thank you for your patience.',
    'Verifying results, please wait a few more seconds.',
    'Summarizing recipe using AI.',
    'Almost there! Performing a final review.',
    'Will finish in the next 5 seconds.',
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showMessages, setShowMessages] = useState(false)

  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setShowMessages(true)
    }, 5000)

    const interval = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(messageTimer)
    }
  }, [])

  return (
    <SafeAreaView
      style={{
        ...{
          backgroundColor: theme.colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        },
        ...style,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} size='large' />
      {showMessages && (
        <Text
          style={{
            color: theme.colors.text,
            marginTop: 20,
            textAlign: 'center',
            paddingHorizontal: 30,
          }}
        >
          {loadingMessages[currentMessageIndex]}
        </Text>
      )}
    </SafeAreaView>
  )
}
