import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../style/style'
import { View, Text, StyleSheet } from 'react-native'

export default function RecordCook({ showText = false }) {
  const containerStyle = showText ? styles.ctaContainer : styles.circleContainer

  const iconSize = showText ? 24 : 20

  return (
    <View style={containerStyle}>
      <MaterialCommunityIcons name='camera' color={theme.colors.white} size={iconSize} />
      {showText && <Text style={styles.ctaText}>Record cook</Text>}
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: 14,
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
