import React, { useRef, useEffect } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PrimaryButton, SecondaryButton } from '../../components/Button'
import ModalCard from '../../components/ModalCard'
import { theme } from '../../style/style'
import Bounce from '../Bounce'

const AnimatedPoint = ({ text, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <MaterialCommunityIcons 
        name="check-circle" 
        size={20} 
        color={theme.colors.primary} 
        style={{ marginRight: 8 }}
      />
      <Text style={styles.confirmationPoint}>{text}</Text>
    </Animated.View>
  )
}

const ConfirmationModal = ({ visible, onClose, onConfirm }) => {
  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      titleComponent={
        <View style={{ flex: 1, gap: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Bounce trigger={visible} delay={2500}>
            <MaterialCommunityIcons 
              name="notebook" 
              size={40} 
              color={theme.colors.primary} 
            />
          </Bounce>
          <Text style={styles.modalTitle}>Ready to add?</Text>
        </View>
      }
    >
      <View style={styles.confirmationPoints}>
        <AnimatedPoint 
          text="Will be saved on your Cooked.wiki journal." 
          delay={500}
        />
        <AnimatedPoint 
          text="Your followers will be notified." 
          delay={1000}
        />
        <AnimatedPoint 
          text="People cooking the same recipe will get inspiration from you." 
          delay={1500}
        />
      </View>
      <View style={styles.modalButtons}>
        <PrimaryButton title="Add to journal" onPress={onConfirm} />
        <SecondaryButton title="Not yet" onPress={onClose} style={styles.cancelButton} />
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  confirmationPoints: {
    marginBottom: 16,
    paddingTop: 16,
  },
  confirmationPoint: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    flex: 1,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
  },
})

export default ConfirmationModal 