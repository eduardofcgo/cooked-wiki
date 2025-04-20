import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { theme } from '../../style/style'

const HeaderText = ({ children }) => <Text style={styles.headerText}>{children}</Text>

const styles = StyleSheet.create({
  headerText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
    paddingBottom: 20,
  },
})

export default HeaderText
