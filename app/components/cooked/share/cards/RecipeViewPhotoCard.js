import React, { useRef, useEffect, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import CookedWebView from '../../../CookedWebView'
import { theme } from '../../../../style/style'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../../../../urls'
import { useNavigation } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'

const Image = FastImage

const RecipeViewPhotoCard = ({ cooked }) => {
  const navigation = useNavigation()
  const route = useRoute()
  const webViewRef = useRef(null)
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 })

  const recipeId = cooked['recipe-id']
  const extractId = cooked['extract-id']
  const cookedRecipeUrl = recipeId
    ? getSavedRecipeUrl(recipeId)
    : extractId
      ? getRecentExtractUrl(extractId)
      : undefined

  const handleWebViewReady = useCallback(() => {
    if (webViewRef.current) {
      const simpleZoomJS = `
                const style = document.createElement('style');
                style.innerHTML = \`
                    body {
                        zoom: 0.75 !important;
                        -webkit-transform: scale(0.75) !important;
                        -webkit-transform-origin: 0 0 !important;
                        transform: scale(0.75) !important;
                        transform-origin: 0 0 !important;
                        margin-top: 0 !important;
                        position: relative !important;
                        top: -270px !important;
                    }
                \`;
                document.head.appendChild(style);
                true;
            `

      if (webViewRef.current.injectJavaScript) {
        webViewRef.current.injectJavaScript(simpleZoomJS)
      }
    }
  }, [])

  const handleLayout = event => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  // Calculate scaled dimensions based on container size (using base width of 300 like TwoPhotoCard)
  const scale = containerDimensions.width > 0 ? containerDimensions.width / 300 : 1

  // Circular photo scaling
  const circularPhotoSize = 250 * scale
  const circularPhotoBorderRadius = circularPhotoSize
  const circularPhotoTranslateX = 65 * scale
  const circularPhotoTranslateY = 50 * scale

  // Bottom photo scaling
  const bottomPhotoSize = 150 * scale
  const bottomPhotoBorderRadius = bottomPhotoSize
  const bottomPhotoTranslateX = 40 * scale
  const bottomPhotoTranslateY = 20 * scale

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {cookedRecipeUrl ? (
        <View style={styles.webViewContainer}>
          <CookedWebView
            ref={webViewRef}
            startUrl={cookedRecipeUrl}
            navigation={navigation}
            route={route}
            onRequestPath={() => {}}
            style={styles.webView}
            dynamicHeight={false}
            onWebViewReady={handleWebViewReady}
          />
        </View>
      ) : null}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.6, 1]}
        style={styles.gradientOverlay}
      />

      <View style={styles.contentOverlay}>
        <View style={styles.cardInfoContainer}>
          <View style={styles.middleSection}>
            {cooked['cooked-photos-urls']?.[0] ? (
              <Image
                source={{ uri: cooked['cooked-photos-urls']?.[0] }}
                style={[
                  styles.circularPhoto,
                  {
                    width: circularPhotoSize,
                    height: circularPhotoSize,
                    borderRadius: circularPhotoBorderRadius,
                    transform: [{ translateX: circularPhotoTranslateX }, { translateY: circularPhotoTranslateY }],
                  },
                ]}
              />
            ) : cooked['recipe-photo-url'] ? (
              <Image
                source={{ uri: cooked['recipe-photo-url'] }}
                style={[
                  styles.circularPhoto,
                  {
                    width: circularPhotoSize,
                    height: circularPhotoSize,
                    borderRadius: circularPhotoBorderRadius,
                    transform: [{ translateX: circularPhotoTranslateX }, { translateY: circularPhotoTranslateY }],
                  },
                ]}
              />
            ) : null}

            {cooked['cooked-photos-urls']?.[1] ? (
              <Image
                source={{ uri: cooked['cooked-photos-urls']?.[1] }}
                style={[
                  styles.bottomPhoto,
                  {
                    width: bottomPhotoSize,
                    height: bottomPhotoSize,
                    borderRadius: bottomPhotoBorderRadius,
                    transform: [{ translateX: bottomPhotoTranslateX }, { translateY: bottomPhotoTranslateY }],
                  },
                ]}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '56.25%', // 9/16 = 0.5625, so width should be 56.25% of height to maintain aspect ratio
    aspectRatio: 9 / 16, // Instagram Story ratio
    position: 'relative',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    alignSelf: 'center',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  contentOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardInfoContainer: {
    paddingHorizontal: 6,
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {},
  logoContainer: {
    transform: [{ scale: 0.3 }],
    marginBottom: -25,
    marginLeft: -5,
    alignSelf: 'center',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recipeName: {
    fontSize: 22,
    fontFamily: theme.fonts.title,
    color: theme.colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  circularPhoto: {
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  bottomPhoto: {
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.background,
    marginTop: 10,
  },
})

export default RecipeViewPhotoCard
