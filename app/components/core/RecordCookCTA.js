import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../style/style'
import { View, Text, StyleSheet } from 'react-native'

export default function RecordCookCTA({
  text = 'Record cook',
  showIcon = true,
  showText = false,
  size = null,
  iconSize = null,
}) {
  const containerStyle = showText ? styles.ctaContainer : styles.circleContainer

  return (
    <View style={[containerStyle, size && { height: size, width: size }]}>
      {showIcon && <MaterialCommunityIcons name='camera' color={theme.colors.white} size={iconSize || 20} />}
      {showText && <Text style={styles.ctaText}>{text}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  circleContainer: {
    height: 56,
    width: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.small,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.small,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  descriptionText: {
    color: theme.colors.white,
    fontSize: 12,
    marginLeft: 8,
    marginTop: 4,
  },
})
