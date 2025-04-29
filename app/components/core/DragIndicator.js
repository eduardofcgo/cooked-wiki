import React from 'react'
import { StyleSheet, View } from 'react-native'
import { theme } from '../../style/style'

const DragIndicator = ({ style }) => {
  return <View style={[styles.dragIndicator, style]} />
}

const styles = StyleSheet.create({
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.default,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
})

export default DragIndicator
