import React from 'react'
import { Modal, StyleSheet, Text, View, SafeAreaView } from 'react-native'
import Reanimated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { theme } from '../../style/style'
import { PrimaryButton } from '../core/Button'
import DrawnArrow from '../core/DrawnArrow'

export const FindFriendsOnboardingModal = ({ visible, onClose }) => {
  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1, { duration: 1000 }),
              withTiming(1.05, { duration: 500 }),
              withTiming(1, { duration: 1000 }),
            ),
            -1,
          ),
        },
      ],
    }
  })

  return (
    <Modal visible={visible} transparent={true} animationType='fade'>
      <SafeAreaView style={styles.modalOverlay}>
        <Reanimated.View style={[pulseAnim]}>
          <View style={styles.clearCircle}>
            <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
          </View>
        </Reanimated.View>

        <View style={styles.arrowContainer}>
          <DrawnArrow />
        </View>

        <View style={styles.modalTouchable}>
          <View style={styles.modalContent}>
            <Icon name='account-multiple' size={20} color={theme.colors.softBlack} />
            <Text style={styles.modalText}>You can always tap the icon at the top right corner to find friends.</Text>
            <PrimaryButton title='Got it!' onPress={onClose} textStyle={styles.buttonText} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clearCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    top: 70,
    right: 40,
    transform: [{ rotate: '30deg' }],
  },
  modalContent: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
