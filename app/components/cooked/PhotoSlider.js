import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const PhotoSlider = ({ images, photoStyle, onDoubleTap, onImageSlide }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    onImageSlide && onImageSlide(currentImageIndex)
  }, [currentImageIndex, onImageSlide])

  const hasMultiplePhotos = images?.length > 1

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          const contentOffset = event.nativeEvent.contentOffset.x
          const newIndex = Math.round(contentOffset / SCREEN_WIDTH)
          if (newIndex !== currentImageIndex) {
            setCurrentImageIndex(newIndex)
          }
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Animated.Image source={{ uri: item }} style={[styles.photo, photoStyle]} resizeMode='cover' />
        )}
        keyExtractor={(item, index) => `photo-${index}`}
      />

      {/* Pagination indicators */}
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
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 10,
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
