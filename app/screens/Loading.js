import React from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function Loading({ style }) {
  return (
    <View
      style={{
        ...{
          backgroundColor: '#efede3',
          justifyContent: 'center',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        },
        ...style,
      }}
    >
      <ActivityIndicator color='#d97757' size='large' />
    </View>
  )
}
