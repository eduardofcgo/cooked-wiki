import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { theme } from '../../style/style'

const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <Text allowFontScaling={false} style={[styles.logo, styles.firstWordColor]}>
        Cook
      </Text>
      <Text allowFontScaling={false} style={[styles.logo, styles.lastWord]}>
        ed
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    color: '#706b57',
  },
  logo: {
    fontSize: 70,
    fontFamily: theme.fonts.title,
  },
  firstWordColor: {
    color: '#d97757',
  },
  lastWord: {
    color: '#706b57',
    letterSpacing: -5.5,
  },
})

export default Logo
