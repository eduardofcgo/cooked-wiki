import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../style/style'

export const StepIndicator = ({ number, text, isActive, isFilled }) => (
  <View style={styles.stepContainer}>
    <View
      style={[
        styles.stepNumber,
        !isActive && !isFilled && styles.stepNumberInactive,
        isFilled && styles.stepNumberFilled,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.stepNumberText,
          !isActive && !isFilled && styles.stepNumberTextInactive,
          isFilled && styles.stepNumberTextFilled,
        ]}
      >
        {number}
      </Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
)

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.uiBold,
    fontSize: theme.fontSizes.small,
    fontWeight: 'bold',
  },
  stepNumberTextInactive: {
    color: theme.colors.black,
  },
  stepText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    fontWeight: '500',
  },
  stepNumberInactive: {
    backgroundColor: theme.colors.softBlack,
    opacity: 0.33,
  },
  stepNumberFilled: {
    backgroundColor: theme.colors.softBlack,
  },
  stepNumberTextFilled: {
    color: theme.colors.background,
  },
})

export default StepIndicator
