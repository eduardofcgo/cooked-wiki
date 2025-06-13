import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import FastImage from 'react-native-fast-image'
import { LinearGradient } from 'expo-linear-gradient'
import Logo from '../../../core/Logo'
import { theme } from '../../../../style/style'
import { observer } from 'mobx-react-lite'

const Image = FastImage

const ZoomedImage = observer(({ imageUrl }) => {
  return (
    <View style={styles.zoomedPhotoContainer}>
      <Image source={{ uri: imageUrl }} style={styles.zoomedPhoto} />
    </View>
  )
})

const TwoPhotoCard = ({ cooked }) => {
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 })

  const recipeTitle = cooked['recipe-title'] || cooked['extract-title'] || cooked['title']

  const handleLayout = event => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  const logoScale = containerDimensions.width > 0 ? (containerDimensions.width / 300) * 0.4 : 0.3

  const textScale = containerDimensions.width > 0 ? containerDimensions.width / 300 : 1
  const scaledFontSize = 33 * textScale

  // Scale the translateY proportionally with the container size
  const baseTranslateY = 100 // Base percentage value
  const scaledTranslateY =
    containerDimensions.width > 0 ? baseTranslateY * (containerDimensions.width / 300) : baseTranslateY

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {cooked['cooked-photos-urls']?.[0] ? (
        <Image source={{ uri: cooked['cooked-photos-urls']?.[0] }} style={styles.mainPhoto} />
      ) : cooked['recipe-photo-url'] ? (
        <Image source={{ uri: cooked['recipe-photo-url'] }} style={styles.recipePhoto} />
      ) : null}

      <View style={styles.photoContainer}>
        {cooked['cooked-photos-urls'].length >= 2 ? (
          <Image source={{ uri: cooked['cooked-photos-urls']?.[1] }} style={styles.photo} />
        ) : (
          cooked['cooked-photos-urls']?.[0] && <ZoomedImage imageUrl={cooked['cooked-photos-urls']?.[0]} />
        )}
      </View>

      {cooked['cooked-photos-urls']?.length > 0 && (
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.8, 0.9, 1]}
          style={styles.gradientOverlay}
        />
      )}

      <View style={styles.imageOverlay}>
        <View style={[styles.logoContainer, { transform: [{ scale: logoScale }, { translateY: scaledTranslateY }] }]}>
          <Logo />
        </View>
      </View>

      <View style={styles.recipeNameContainer}>
        <Text allowFontScaling={false} style={[styles.recipeName, { fontSize: scaledFontSize }]}>
          {recipeTitle}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    maxWidth: '56.25%', // 9/16 = 0.5625, so width should be 56.25% of height to maintain aspect ratio
    aspectRatio: 9 / 16, // Instagram Story ratio
    position: 'relative',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: theme.colors.secondary,
    alignSelf: 'center',
    flexDirection: 'column',
  },
  photoContainer: {
    flex: 1,
    width: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  zoomedPhotoContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  zoomedPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ scale: 1.5 }, { scaleX: -1 }],
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  logoContainer: {
    alignSelf: 'center',
  },
  recipeName: {
    fontSize: 22,
    fontFamily: theme.fonts.title,
    color: theme.colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  recipeNameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 16,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recipePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
})

export default observer(TwoPhotoCard)
