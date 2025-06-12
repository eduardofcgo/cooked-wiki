import React from 'react'
import { TouchableOpacity, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../../style/style'

function SaveButton({
  onPress,
  isLoading = false,
  disabled = false,
  size = 22,
  color = theme.colors.softBlack,
  style,
}) {
  const buttonOpacity = disabled || isLoading ? theme.opacity.disabled : 1

  return (
    <TouchableOpacity
      style={[
        {
          paddingHorizontal: 8,
          paddingVertical: 8,
          minWidth: 60,
          alignItems: 'center',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size='small' color={color} style={{ opacity: buttonOpacity }} />
      ) : (
        <MaterialCommunityIcons name='content-save' size={size} color={color} style={{ opacity: buttonOpacity }} />
      )}
    </TouchableOpacity>
  )
}

export default SaveButton
