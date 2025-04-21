import React, { useEffect } from 'react'
import { StatusBar, Platform } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { theme } from '../style/style'

export default function FadeInStatusBar({ color = theme.colors.primary }) {
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      // Android-specific background color change
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.colors.secondary, true)
      }

      const timer = setTimeout(() => {
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(color, true)
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(theme.colors.secondary, true)
        }
      }
    }
  }, [isFocused, color])

  return <StatusBar barStyle='dark-content' translucent />
}
