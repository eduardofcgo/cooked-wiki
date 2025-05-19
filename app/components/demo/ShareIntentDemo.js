import { Ionicons } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { theme } from '../../style/style'

const ShareIntentDemo = ({
  screenshots,
  animationSource = require('../../../assets/animations/click.json'),
  cycleDelay = 2000, // Time each screenshot is shown (in ms)
  initialDelay = 0, // Initial delay before starting the demo
  stickyIndex = null, // If provided, stays on this specific screenshot index
  onComplete, // Callback function that is called when the demo ends
}) => {
  const [currentIndex, setCurrentIndex] = useState(stickyIndex !== null ? stickyIndex : 0)
  const [demoCompleted, setDemoCompleted] = useState(false)
  const [isRunning, setIsRunning] = useState(true)
  const currentScreenshot = screenshots[currentIndex]

  const restartDemo = () => {
    setCurrentIndex(0)
    setDemoCompleted(false)
    setIsRunning(true)
  }

  useEffect(() => {
    // Update currentIndex when stickyIndex changes
    if (stickyIndex !== null) {
      setCurrentIndex(stickyIndex)
    }
  }, [stickyIndex])

  useEffect(() => {
    // Skip the effect if there's only one screenshot or if stickyIndex is provided
    // or if the demo is not running
    if (screenshots.length <= 1 || stickyIndex !== null || !isRunning) return

    // Set up the interval to cycle through the screenshots
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1
        // Check if we've reached the end of the screenshots
        if (nextIndex >= screenshots.length) {
          setDemoCompleted(true)
          setIsRunning(false)
          return prevIndex
        }
        return nextIndex
      })
    }, cycleDelay)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [screenshots.length, cycleDelay, stickyIndex, isRunning])

  // Call onComplete callback when demo finishes
  useEffect(() => {
    if (demoCompleted && onComplete) {
      onComplete()
    }
  }, [demoCompleted, onComplete])

  if (!currentScreenshot) return null

  return (
    <Animated.View style={styles.demoContainer} entering={FadeIn.delay(initialDelay).duration(500)}>
      {currentScreenshot.label && (
        <Animated.Text
          style={styles.labelText}
          key={`label-${currentIndex}`}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          {currentScreenshot.label}
        </Animated.Text>
      )}

      {demoCompleted && (
        <TouchableOpacity style={styles.restartButton} onPress={restartDemo}>
          <Ionicons name='refresh-outline' size={18} color={theme.colors.softBlack} style={styles.restartIcon} />
          <Animated.Text style={styles.restartButtonText} entering={FadeIn.duration(300)}>
            Play again
          </Animated.Text>
        </TouchableOpacity>
      )}

      <Animated.View
        key={`screenshot-${currentIndex}`}
        style={styles.screenshotContainer}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
      >
        <Image source={currentScreenshot.source} style={styles.screenshot} resizeMode='contain' />

        <Image
          source={require('../../../assets/demo/iphone_xr_frame.png')}
          style={styles.phoneFrame}
          resizeMode='contain'
        />

        {currentScreenshot.animationPosition && (
          <LottieView
            source={animationSource}
            style={[styles.clickAnimation, currentScreenshot.animationPosition]}
            autoPlay
            loop
            key={`animation-${currentIndex}`}
          />
        )}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  screenshotContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  screenshot: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
  },
  phoneFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  clickAnimation: {
    position: 'absolute',
    width: 200,
    height: 200,
    transform: [{ translateX: -25 }, { translateY: -30 }],
    zIndex: 3,
  },
  labelText: {
    minWidth: 170,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    zIndex: 10,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    maxWidth: '90%',
    elevation: 3,
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  restartButton: {
    minWidth: 170,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.default,
    zIndex: 10,
    marginTop: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartIcon: {
    marginRight: 8,
  },
  restartButtonText: {
    color: theme.colors.softBlack,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.default,
  },
})

export default ShareIntentDemo
