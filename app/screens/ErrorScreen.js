import React from 'react'
import { SafeAreaView, Text } from 'react-native'
import { theme } from '../style/style'

export default function ErrorScreen({ style }) {
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
      <Text
        style={{
          color: theme.colors.error || theme.colors.primary,
          fontSize: 16,
          textAlign: 'center',
          paddingHorizontal: 20,
        }}
      >
        Unexpected error. Please try again later.
      </Text>
    </SafeAreaView>
  )
}
