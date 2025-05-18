import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../style/style'
import { MaterialIcons } from '@expo/vector-icons'

export default function NewExtractError({ style, onRetry, errorMessage = 'Something went wrong.' }) {
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
      <MaterialIcons name='error-outline' size={60} color={theme.colors.error || '#FF5252'} />

      <Text
        style={{
          color: theme.colors.text,
          marginTop: 20,
          textAlign: 'center',
          paddingHorizontal: 30,
          fontSize: 16,
          marginBottom: 30,
        }}
      >
        {errorMessage}
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
