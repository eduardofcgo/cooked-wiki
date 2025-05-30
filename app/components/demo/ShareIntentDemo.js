import { MaterialIcons } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Animated, { FadeIn, FadeOut, BounceIn } from 'react-native-reanimated'
import { theme } from '../../style/style'

const ShareIntentDemo = ({
  screenshots,
  animationSource,
  cycleDelay = 2000, // Time each screenshot is shown (in ms)
  initialDelay = 0, // Initial delay before starting the demo
  stickyIndex = null, // If provided, stays on this specific screenshot index
  onComplete, // Callback function that is called when the demo ends
}) => {
  const [currentIndex, setCurrentIndex] = useState(stickyIndex !== null ? stickyIndex : 0)
  const [demoCompleted, setDemoCompleted] = useState(false)
  const [isRunning, setIsRunning] = useState(true)
  const [isRestarting, setIsRestarting] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const currentScreenshot = screenshots[currentIndex]

  // Function to calculate translation based on percentage of image's actual size and position
  const calculateTranslation = position => {
    if (
      !position ||
      !imageDimensions.width ||
      !imageDimensions.height ||
      !containerDimensions.width ||
      !containerDimensions.height
    ) {
      return { translateX: 0, translateY: 0 }
    }

    // Calculate the scale and position of the image within its container
    const imageAspectRatio = imageDimensions.width / imageDimensions.height
    const containerAspectRatio = containerDimensions.width / containerDimensions.height

    let scaledImageWidth, scaledImageHeight, imageOffsetX, imageOffsetY

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider, scale to fit width
      scaledImageWidth = containerDimensions.width
      scaledImageHeight = containerDimensions.width / imageAspectRatio
      imageOffsetX = 0
      imageOffsetY = (containerDimensions.height - scaledImageHeight) / 2
    } else {
      // Image is taller, scale to fit height
      scaledImageHeight = containerDimensions.height
      scaledImageWidth = containerDimensions.height * imageAspectRatio
      imageOffsetX = (containerDimensions.width - scaledImageWidth) / 2
      imageOffsetY = 0
    }

    let translateX = 0
    let translateY = 0

    // Calculate position relative to the actual image content
    if (position.left !== undefined) {
      if (typeof position.left === 'string' && position.left.includes('%')) {
        const percentage = parseFloat(position.left) / 100
        translateX = imageOffsetX + scaledImageWidth * percentage - containerDimensions.width / 2
      } else {
        translateX = position.left
      }
    } else if (position.right !== undefined) {
      if (typeof position.right === 'string' && position.right.includes('%')) {
        const percentage = parseFloat(position.right) / 100
        translateX = imageOffsetX + scaledImageWidth * (1 - percentage) - containerDimensions.width / 2
      } else {
        translateX = -position.right
      }
    }

    if (position.top !== undefined) {
      if (typeof position.top === 'string' && position.top.includes('%')) {
        const percentage = parseFloat(position.top) / 100
        translateY = imageOffsetY + scaledImageHeight * percentage - containerDimensions.height / 2
      } else {
        translateY = position.top
      }
    } else if (position.bottom !== undefined) {
      if (typeof position.bottom === 'string' && position.bottom.includes('%')) {
        const percentage = parseFloat(position.bottom) / 100
        translateY = imageOffsetY + scaledImageHeight * (1 - percentage) - containerDimensions.height / 2
      } else {
        translateY = -position.bottom
      }
    }

    return { translateX, translateY }
  }

  const handleImageLoad = event => {
    const { width, height } = event.nativeEvent.source
    setImageDimensions({ width, height })
  }

  const handleContainerLayout = event => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  const restartDemo = () => {
    setIsRestarting(true)

    // Wait for fade out animation to complete (600ms duration)
    setTimeout(() => {
      setCurrentIndex(0)
      setDemoCompleted(false)
      setIsRunning(true)
      setIsRestarting(false)
    }, 600)
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
    <Animated.View style={[styles.demoContainer]} entering={FadeIn.delay(initialDelay).duration(500)}>
      {!isRestarting && (
        <>
          {currentScreenshot.label && (
            <Animated.Text
              style={styles.labelText}
              key={`label-${currentIndex}`}
              entering={currentIndex === screenshots.length - 1 ? BounceIn.duration(1000) : FadeIn.duration(300)}
            >
              {currentScreenshot.label}
            </Animated.Text>
          )}

          {demoCompleted && (
            <Animated.View entering={FadeIn.duration(300)}>
              <TouchableOpacity style={styles.restartButton} onPress={restartDemo}>
                <MaterialIcons name='refresh' size={20} color={theme.colors.softBlack} style={styles.restartIcon} />
                <Animated.Text style={styles.restartButtonText}>Play again</Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View
            key={`screenshot-${currentIndex}`}
            style={styles.screenshotContainer}
            entering={FadeIn.duration(600)}
          >
            <Animated.View style={styles.imageWrapper} onLayout={handleContainerLayout}>
              <Image
                source={currentScreenshot.source}
                style={styles.screenshot}
                resizeMode='contain'
                onLoad={handleImageLoad}
              />

              {currentScreenshot.animationPosition && (
                <LottieView
                  source={animationSource}
                  style={[
                    styles.clickAnimation,
                    {
                      transform: [
                        { translateX: calculateTranslation(currentScreenshot.animationPosition).translateX },
                        { translateY: calculateTranslation(currentScreenshot.animationPosition).translateY },
                      ],
                    },
                  ]}
                  autoPlay
                  loop
                  key={`animation-${currentIndex}`}
                />
              )}
            </Animated.View>
          </Animated.View>
        </>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    paddingVertical: 32,
    paddingHorizontal: 32,
  },
  screenshotContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshot: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  clickAnimation: {
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 3,
    width: '100%',
    height: '100%',
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
    width: 20,
    height: 20,
    marginRight: 8,
  },
  restartButtonText: {
    color: theme.colors.softBlack,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.default,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ShareIntentDemo
