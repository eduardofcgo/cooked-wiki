import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Logo from '../../../core/Logo'
import { theme } from '../../../../style/style'

const SinglePhotoCard = ({ cooked }) => {
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 })

  const handleLayout = event => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  const logoScale = containerDimensions.width > 0 ? (containerDimensions.width / 300) * 0.4 : 0.3

  // Scale the translateY proportionally with the container size
  const baseTranslateY = 60 // Base percentage value
  const scaledTranslateY =
    containerDimensions.width > 0 ? `${baseTranslateY * (containerDimensions.width / 300)}%` : `${baseTranslateY}%`

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {cooked['cooked-photos-urls']?.[0] ? (
        <Image source={{ uri: cooked['cooked-photos-urls']?.[0] }} style={styles.mainPhoto} />
      ) : cooked['recipe-photo-url'] ? (
        <Image source={{ uri: cooked['recipe-photo-url'] }} style={styles.recipePhoto} />
      ) : null}

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
    overflow: 'hidden',
    backgroundColor: theme.colors.secondary,
    alignSelf: 'center',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  recipePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
})

export default SinglePhotoCard
