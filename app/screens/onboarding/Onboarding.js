import React, { useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  SlideOutLeft,
  useSharedValue,
  withTiming,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import LottieView from 'lottie-react-native'

import { PrimaryButton } from '../../components/core/Button'
import Logo from '../../components/core/Logo'
import { theme } from '../../style/style'

const OnboardingScreen = ({ navigation }) => {
  const backgroundColor = useSharedValue(0)

  useEffect(() => {
    backgroundColor.value = 0
    const timeoutId = setTimeout(() => {
      backgroundColor.value = withTiming(1, { duration: 1000 })
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        backgroundColor.value,
        [0, 1],
        [theme.colors.secondary, theme.colors.background],
      ),
    }
  })

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={styles.topSection} entering={FadeInDown.delay(0).duration(3000)}>
        <Logo style={styles.logo} />
        <LottieView
          source={require('../../../assets/animations/cooked_background.json')}
          style={styles.backgroundAnimation}
          autoPlay
          loop
          speed={2}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(3000).duration(1000)}>
        <View>
          <Text
            style={{
              color: theme.colors.black,
              fontFamily: theme.fonts.ui,
              fontSize: theme.fontSizes.default,
              textAlign: 'left',
              paddingHorizontal: 16,
            }}
          >
            When somebody asks for your pancake recipe, just say:
          </Text>
          <Text
            style={{
              color: theme.colors.black,
              fontFamily: theme.fonts.title,
              fontSize: theme.fontSizes.large,
              textAlign: 'right',
              paddingHorizontal: 32,
            }}
          >
            - It's on my <Text style={{ color: theme.colors.black, fontFamily: theme.fonts.title }}>Cooked</Text>!
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <Animated.View style={styles.buttonsContainer} entering={FadeInDown.delay(6000).duration(1000)}>
          <PrimaryButton
            title="Let's start"
            onPress={() => navigation.navigate('HowItWorks')}
            style={styles.nextButton}
            icon={<Icon name='arrow-right' size={20} color='white' />}
          />
          <Text style={styles.subtitle}>Let's see how to create a recipe!</Text>
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
    justifyContent: 'space-between',
    padding: 16,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
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
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.softBlack,
    textAlign: 'center',
    paddingHorizontal: 16,
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
  subtitle: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 16,
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
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 0,
  },
  backgroundAnimation: {
    opacity: theme.opacity.disabled,
    position: 'absolute',
    width: '150%',
    height: '150%',
    zIndex: -1,
    left: '-25%',
    top: '-20%',
  },
})

export default OnboardingScreen
