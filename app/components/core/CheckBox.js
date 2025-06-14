import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../style/style'

export const CheckBox = ({ isChecked, onPress, label, disabled = false }) => (
  <TouchableOpacity style={styles.container} onPress={onPress} disabled={disabled}>
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
      {isChecked && <MaterialCommunityIcons name='check-bold' size={18} color={theme.colors.background} />}
    </View>
    {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: theme.colors.secondary,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxDisabled: {
    borderColor: theme.colors.softBlack,
    opacity: 0.33,
  },
  label: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    fontWeight: '500',
  },
  labelDisabled: {
    opacity: 0.33,
  },
})

export default CheckBox
