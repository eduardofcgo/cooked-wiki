import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { theme } from '../../style/style'
import AnimatedBell from './AnimatedBell'
import { Toast } from './Toast'

const DURATION = 5000

export default InAppNotification = ({ onPress, onClose, children }) => {
  return (
    <>
      <Toast onPress={onPress} onClose={onClose} duration={DURATION}>
        <View style={styles.iconContainer}>
          <AnimatedBell />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {children}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <FontAwesomeIcon icon={faChevronRight} size={14} color={theme.colors.primary} />
        </View>
      </Toast>
    </>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 25,
    height: 25,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
  },
  chevronContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
