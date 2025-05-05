import React, { useEffect, useState, useCallback } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'

const PhotoSlider = ({ images, onImageSlide, imageStyle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sliderWidth, setSliderWidth] = useState(0)

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
      const contentOffset = event.nativeEvent.contentOffset.x
      const newIndex = Math.round(contentOffset / sliderWidth)
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex)
      }
    },
    [currentImageIndex, sliderWidth],
  )

  const renderItem = useCallback(
    ({ item }) => {
      const style = {
        width: sliderWidth,
        aspectRatio: 1,
        zIndex: 10,
        ...imageStyle,
      }
      return <Animated.Image source={{ uri: item }} style={style} resizeMode='cover' />
    },
    [sliderWidth],
  )

  const keyExtractor = useCallback((item, index) => `photo-${index}`, [])

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {sliderWidth > 0 && (
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={{ width: sliderWidth }}
        />
      )}

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
}

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
})

export default PhotoSlider
