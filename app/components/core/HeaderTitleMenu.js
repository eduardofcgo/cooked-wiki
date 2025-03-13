import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../style/style'

const HeaderTitleMenu = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
})

export default HeaderTitleMenu
