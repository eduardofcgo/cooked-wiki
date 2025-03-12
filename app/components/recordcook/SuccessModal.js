import React, { useRef, useEffect } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Button, PrimaryButton, SecondaryButton, TransparentButton } from '../core/Button'
import ModalCard from '../core/ModalCard'
import Bounce from '../core/Bounce'
import { theme } from '../../style/style'

const AnimatedEmoji = ({ emoji, delay, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  )
}

const SuccessModal = ({ visible, onClose, onView, onShare }) => {
  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      titleComponent={
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={styles.emojiContainer}>
            <Bounce trigger={visible}>
              <Text style={styles.emoji}>🎉</Text>
            </Bounce>
            <Text style={styles.modalTitle}>All done!</Text>
            <Bounce trigger={visible} delay={1500}>
              <Text style={styles.emoji}>🎊</Text>
            </Bounce>
          </View>
        </View>
      }
    >
      <View style={styles.content}>
        <Text style={styles.message}>You can share your cook with your friends that are not on Cooked.wiki yet.</Text>
        <View style={styles.buttonGroup}>
          <SecondaryButton
            title='Share'
            onPress={onShare}
            icon={
              <MaterialCommunityIcons name='send' size={16} color={theme.colors.softBlack} style={{ marginRight: 8 }} />
            }
          />
          <TransparentButton title='Not now' onPress={onClose} />
        </View>
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  emoji: {
    fontSize: 32,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  message: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
})

export default SuccessModal
