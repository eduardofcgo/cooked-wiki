import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../style/style'

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, styles.titleHighlight]}>Cook</Text>
        <Text style={styles.title}>ed something new?</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 60,
    marginBottom: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
  },
  titleHighlight: {
    color: theme.colors.primary,
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
})
