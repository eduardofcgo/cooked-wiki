import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'

export default function CookedButtonSecondary({ onPress, children }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 100,
    minHeight: 40,
    borderRadius: 5,
    elevation: 3,
    backgroundColor: '#706b57',
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
  },
})
