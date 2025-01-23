import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { theme } from '../style/style'

export default function Loading({ style }) {
  return (
    <View
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
    </View>
  )
}
