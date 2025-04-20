import React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { theme } from '../../style/style'

export default function Loading({ backgroundColor = theme.colors.background }) {
  return (
    <View
      style={{
        backgroundColor,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} size='large' />
    </View>
  )
}
