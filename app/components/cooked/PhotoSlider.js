import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import FastImage from 'react-native-fast-image'
import { theme } from '../../style/style'
import { FontAwesome } from '@expo/vector-icons'
import { observer } from 'mobx-react-lite'

const FlatList = FlashList

const PhotoSlider = observer(({ images, onImageSlide, imageStyle, onDoubleTap }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sliderWidth, setSliderWidth] = useState(0)
  const [lastTap, setLastTap] = useState(null)
  const [showHeart, setShowHeart] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef(null)
  const lastScrollTime = useRef(0)

  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    onImageSlide && onImageSlide(currentImageIndex)
  }, [currentImageIndex, onImageSlide])

  const hasMultiplePhotos = images?.length > 1

  const handleLayout = useCallback(event => {
    const { width } = event.nativeEvent.layout
    setSliderWidth(width)
  }, [])

  const onScroll = useCallback(
    event => {
      // Track when scroll events occur
      lastScrollTime.current = Date.now()

      // Set scrolling flag
      setIsScrolling(true)

      // Clear any previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      // Reset last tap to prevent accidental double-tap during scroll
      setLastTap(null)

      const contentOffset = event.nativeEvent.contentOffset.x
      const newIndex = Math.round(contentOffset / sliderWidth)
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex)
      }

      // Set a longer timeout to mark scrolling as finished to account for momentum
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
      }, 500) // Increased from 150ms to 500ms
    },
    [currentImageIndex, sliderWidth],
  )

  const animateHeart = useCallback(() => {
    setShowHeart(true)
    scale.value = withSequence(withSpring(1.2, { damping: 5, stiffness: 100 }), withTiming(1, { duration: 200 }))
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 300 }),
    )

    setTimeout(() => {
      setShowHeart(false)
      scale.value = 0
      opacity.value = 0
    }, 1000)
  }, [scale, opacity])

  const handleImagePress = useCallback(() => {
    // Ignore taps while scrolling
    if (isScrolling) return

    const now = Date.now()

    // Additional check: ignore taps that occur too soon after scrolling
    if (now - lastScrollTime.current < 300) {
      return
    }

    // Additional check: if there was a recent scroll, ignore the tap
    // This helps catch cases where scroll momentum just ended
    if (lastTap && now - lastTap < 200) {
      // Too quick after last tap, likely accidental during scroll
      setLastTap(null)
      return
    }

    if (lastTap && now - lastTap < 300) {
      onDoubleTap && onDoubleTap(currentImageIndex)
      setLastTap(null)
      animateHeart()
    } else {
      setLastTap(now)
    }
  }, [lastTap, onDoubleTap, currentImageIndex, animateHeart, isScrolling])

  // Clear the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  const heartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  const renderItem = useCallback(
    ({ item }) => {
      const style = {
        width: sliderWidth,
        aspectRatio: 1,
        zIndex: 10,
        ...imageStyle,
      }
      return (
        <View style={{ width: sliderWidth, position: 'relative' }}>
          <Animated.View style={{ width: sliderWidth }} onTouchEnd={handleImagePress}>
            <FastImage source={{ uri: item }} style={style} resizeMode={FastImage.resizeMode.cover} />
          </Animated.View>
          {showHeart && (
            <Animated.View style={[styles.heartContainer, heartStyle]}>
              <FontAwesome name='heart' size={80} color={theme.colors.pink} />
            </Animated.View>
          )}
        </View>
      )
    },
    [sliderWidth, handleImagePress, showHeart, heartStyle],
  )

  const keyExtractor = useCallback((item, index) => `photo-${index}`, [])

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {sliderWidth > 0 &&
        (images.length > 1 ? (
          <View style={{ width: sliderWidth }}>
            <FlatList
              data={images.slice()}
              estimatedItemSize={2}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
            />
          </View>
        ) : (
          <View style={{ width: sliderWidth }}>{renderItem({ item: images[0] })}</View>
        ))}

      {hasMultiplePhotos && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[styles.paginationDot, index === currentImageIndex && styles.paginationDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background,
    margin: 3,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
})

export default PhotoSlider
