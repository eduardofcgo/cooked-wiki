import React, { useRef, useEffect } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

import StepIndicator from '../core/StepIndicator'

export default function Step({ number, text, isActive, isFilled, children, style, contentStyle, editMode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current // Start 50 units below

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <Animated.View
      style={[
        styles.stepWrapper,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {!editMode && <StepIndicator number={number} text={text} isActive={isActive} isFilled={isFilled} />}
      <View style={[styles.stepContent, contentStyle, editMode && { paddingTop: 0 }]}>{children}</View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  stepWrapper: {
    width: '100%',
    flex: 1,
  },
  stepContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
})
