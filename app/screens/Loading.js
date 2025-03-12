import React from 'react'
import { ActivityIndicator, SafeAreaView } from 'react-native'
import { theme } from '../style/style'

export default function Loading({ style }) {
  return (
    <SafeAreaView
      style={{
        ...{
          backgroundColor: theme.colors.background,
          justifyContent: 'center',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        },
        ...style,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} size='large' />
    </SafeAreaView>
  )
}
