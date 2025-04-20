import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, StyleSheet, Text, ScrollView } from 'react-native'
import { useStore } from '../../context/StoreContext'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'
import { getCookedPhotoUrl, getProfileImageUrl, getThumbnailUrl } from '../../urls'
import FullNotes from './FullNotes'
import Notes from './Notes'
import PhotoSlider from './PhotoSlider'
import SocialMenu from './SocialMenu'
import DoubleTapLike from './DoubleTapLike'
import SimilarCookedFeed from './SimilarCookedFeed'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const Card = ({
  cooked,
  showExpandIcon,
  showShareIcon,
  onActionPress,
  renderDragIndicator,
  photoStyle,
  notesStyle,
  containerStyle,
  photoContainerStyle,
  contentsStyle,
  bodyStyle,
  relativeDate,
  photoSlider,
  collapseNotes,
  showSimilarCooks,
  scrollEnabled,
  rounded,
}) => {
  const navigation = useNavigation()
  const cardRef = useRef(null)

  const cookedId = cooked['id']
  const cookedPhotoPaths = cooked['cooked-photos-path']

  const { profileStore } = useStore()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const navigateToCookedScreen = ({ skipPhotos = false }) => {
    cardRef.current.measure((x, y, width, height, pageX, pageY) => {
      // For smooth screen transition, we pass the previously loaded cooked to the Cooked screen.
      // If the cooked screen does not receive this, the standard animation will be used.

      // The next screen will know the current position of the card
      const startPosition = { x: pageX, y: pageY, width, height }

      let cookedPhotoPaths = cooked['cooked-photos-path']

      if (skipPhotos) {
        cookedPhotoPaths = []
      } else {
        // Make sure that when the user navigates to the Cooked screen,
        // the photo that is currently in view is the first photo showing.
        const inViewPhotoPath = cookedPhotoPaths?.[currentImageIndex]
        const photoPathsWithInViewFirst = [
          inViewPhotoPath,
          ...cookedPhotoPaths.filter(path => path !== inViewPhotoPath),
        ]
        cookedPhotoPaths = photoPathsWithInViewFirst
      }

      const preloadedCooked = { ...cooked, 'cooked-photos-path': cookedPhotoPaths }

      navigation.push('Cooked', { startPosition, preloadedCooked, cookedId })
    })
  }

  const handleNotesPress = () => {
    navigateToCookedScreen({ skipPhotos: true })
  }

  const goToRecipe = () => {
    navigation.navigate('Recipe', { recipeId: cooked['recipe-id'], extractId: cooked['extract-id'] })
  }

  const handleImageSlide = useCallback(imageSlideIndex => {
    setCurrentImageIndex(imageSlideIndex)
  }, [])

  // Process photo paths
  const photoUrls = cookedPhotoPaths?.map(path => getCookedPhotoUrl(path))
  const recipePhotoUrl = getThumbnailUrl(cooked['recipe-image-path'])

  const onDoubleTapPhoto = useCallback(() => {
    profileStore.likeCooked(cookedId)
  }, [cookedId, profileStore])

  return (
    <Animated.View
      ref={cardRef}
      style={[
        styles.container,
        containerStyle,
        rounded && {
          borderBottomLeftRadius: theme.borderRadius.default,
          borderBottomRightRadius: theme.borderRadius.default,
        },
      ]}
      //   sharedTransitionTag={'cooked-card-' + cookedId}
    >
      {!photoUrls && (
        <DoubleTapLike onDoubleTap={onDoubleTapPhoto}>
          <Image source={{ uri: recipePhotoUrl }} style={styles.recipePhoto} />
        </DoubleTapLike>
      )}

      {photoUrls && (
        <Animated.View style={photoContainerStyle}>
          {photoSlider ? (
            <PhotoSlider
              images={photoUrls}
              photoStyle={photoStyle}
              onImagePress={navigateToCookedScreen}
              onImageSlide={handleImageSlide}
              cookedId={cookedId}
              onDoubleTap={onDoubleTapPhoto}
            />
          ) : (
            photoUrls.map((photoUrl, index) => (
              <DoubleTapLike onDoubleTap={onDoubleTapPhoto}>
                <Animated.Image source={{ uri: photoUrl }} style={[styles.photo, photoStyle]} resizeMode='cover' />
              </DoubleTapLike>
            ))
          )}
        </Animated.View>
      )}

      {renderDragIndicator && renderDragIndicator()}

      <Animated.View style={[styles.contents, contentsStyle]}>
        <SocialMenu
          cookedId={cookedId}
          onActionPress={onActionPress}
          profileImage={getProfileImageUrl(cooked['username'])}
          username={cooked['username']}
          date={cooked['cooked-date']}
          showExpandIcon={showExpandIcon}
          showShareIcon={showShareIcon}
          relativeDate={relativeDate}
        />

        {scrollEnabled?.value ? (
          <Animated.ScrollView
            style={[styles.body, !cooked['notes'] && { paddingBottom: 0 }, bodyStyle]}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {collapseNotes ? (
              <Notes notes={cooked['notes']} goToCooked={handleNotesPress} goToRecipe={goToRecipe} />
            ) : (
              <FullNotes notes={cooked['notes']} />
            )}

            {showSimilarCooks && <SimilarCookedFeed recipeId={cooked['recipe-id'] || cooked['extract-id']} />}
          </Animated.ScrollView>
        ) : (
          <Animated.View
            style={[
              styles.body,
              !cooked['notes'] && { paddingBottom: 0 },
              bodyStyle,
              rounded && {
                borderBottomLeftRadius: theme.borderRadius.default,
                borderBottomRightRadius: theme.borderRadius.default,
              },
            ]}
          >
            {collapseNotes ? (
              <Notes notes={cooked['notes']} goToCooked={handleNotesPress} goToRecipe={goToRecipe} />
            ) : (
              <FullNotes notes={cooked['notes']} />
            )}

            {showSimilarCooks && <SimilarCookedFeed recipeId={cooked['recipe-id'] || cooked['extract-id']} />}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.secondary,
  },
  touchableContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  contents: {
    transform: [{ translateY: 0 }],
    userSelect: 'none',
    zIndex: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    minHeight: 0,
    backgroundColor: theme.colors.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.softBlack,
    opacity: theme.opacity.disabled,
  },
  recipePhoto: {
    width: 110,
    height: 110,
    marginTop: 16,
    marginLeft: 16,
    borderRadius: theme.borderRadius.default,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 10,
  },
})

export default Card
