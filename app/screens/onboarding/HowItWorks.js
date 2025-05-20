import React from 'react'
import { StyleSheet, View, Dimensions, Platform } from 'react-native'
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { LinearGradient } from 'expo-linear-gradient'

import { PrimaryButton } from '../../components/core/Button'
import ShareIntentDemo from '../../components/demo/ShareIntentDemo'
import { theme } from '../../style/style'

const screenshots = [
  {
    source: require('../../../assets/demo/ios_youtube_short_1.png'),
    label: 'Got to any webpage or video',
    overlay: true,
  },
  {
    source: require('../../../assets/demo/ios_youtube_short_1.png'),
    animationPosition: { top: '60%', left: '65%' },
    label: 'Tap the share button',
  },
  {
    source: require('../../../assets/demo/ios_youtube_short_2.png'),
    animationPosition: { top: '70%', left: '47%' },
    label: 'Tap the share button',
  },
  {
    source: require('../../../assets/demo/ios_youtube_short_3.png'),
    animationPosition: { top: '59%', left: '39%' },
    label: 'Share to the Cooked.wiki app',
  },
  {
    source: require('../../../assets/demo/ios_youtube_short_4.png'),
    label: 'And start cooking!',
  },
]

const HowItWorks = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width
  const isIPad = Platform.OS === 'ios' && (Platform.isPad || screenWidth >= 768)

  return (
    <Animated.View style={styles.container} entering={SlideInRight.duration(1000)}>
      <View style={styles.content}>
        <ShareIntentDemo screenshots={screenshots} />
        {!isIPad && (
          <LinearGradient
            colors={[theme.colors.background, theme.colors.background, 'transparent']}
            locations={[0, 0.01, 0.4]}
            style={styles.topGradient}
            pointerEvents='none'
          />
        )}
      </View>

      <View style={styles.bottomSection}>
        <Animated.View style={styles.buttonsContainer} entering={FadeInDown.delay(10000).duration(500)}>
          <PrimaryButton
            title='Got it!'
            onPress={() => navigation.navigate('OnboardingNotifications')}
            style={styles.nextButton}
            icon={<Icon name='arrow-right' size={20} color='white' />}
          />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[...Array(3).keys()].map(index => (
            <View key={index} style={[styles.dot, index === 1 && styles.activeDot]} />
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 32,
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
    paddingTop: 32,
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
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
  },
})

export default HowItWorks
