import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../style/style'

const HeaderTitleMenu = ({ title, reverse = false, children }) => {
  return (
    <View style={[styles.container, { flexDirection: reverse ? 'row-reverse' : 'row' }]}>
      <Text style={styles.title}>{title}</Text>

      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
})

export default HeaderTitleMenu
