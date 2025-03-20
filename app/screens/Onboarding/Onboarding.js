import React, { useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, SlideOutLeft } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { PrimaryButton } from '../../components/core/Button'
import Logo from '../../components/core/Logo'
import { theme } from '../../style/style'

const OnboardingScreen = ({ navigation }) => {
  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.background, true)
  }, [])

  return (
    <Animated.View style={styles.container} exiting={SlideOutLeft.duration(400).springify()}>
      <View style={styles.content}>
        <Logo />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.description}>What are your friends cooking?</Text>

        <Animated.View style={styles.buttonsContainer} entering={FadeInDown.delay(500).duration(500)}>
          <PrimaryButton
            title='How it works'
            onPress={() => navigation.navigate('HowItWorks')}
            style={styles.nextButton}
            icon={<Icon name='arrow-right' size={20} color='white' />}
          />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((_, index) => (
            <View key={index} style={[styles.dot, index === 0 && styles.activeDot]} />
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 0.5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row-reverse',
    gap: 8,
    justifyContent: 'space-between',
  },
  bottomSection: {
    flex: 0.6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  footer: {
    paddingBottom: 16,
    backgroundColor: theme.colors.backgroundColor,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
})

export default OnboardingScreen
