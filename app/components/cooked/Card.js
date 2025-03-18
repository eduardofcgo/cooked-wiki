import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'
import { getCookedPhotoUrl, getProfileImageUrl } from '../../urls'
import PhotoSlider from './PhotoSlider'
import SocialMenu from './SocialMenu'

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
}) => {
  const navigation = useNavigation()
  const cardRef = useRef(null)

  const cookedId = cooked['id']
  const cookedPhotoPaths = cooked['cooked-photos-path']

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePress = () => {
    if (cardRef.current) {
      cardRef.current.measure((x, y, width, height, pageX, pageY) => {
        // For smooth screen transition, we pass the previously loaded cooked to the Cooked screen.
        // If the cooked screen does not receive this, the standard animation will be used.

        // The next screen will know the current position of the card
        const startPosition = { x: pageX, y: pageY, width, height }

        // Make sure that when the user navigates to the Cooked screen,
        // the photo that is currently in view is the first photo showing.
        const inViewPhotoPath = cookedPhotoPaths?.[currentImageIndex]
        const photoPathsWithInViewFirst = [
          inViewPhotoPath,
          ...cookedPhotoPaths.filter(path => path !== inViewPhotoPath),
        ]

        const preloadedCooked = { ...cooked, 'cooked-photos-path': photoPathsWithInViewFirst }

        navigation.navigate('Cooked', { startPosition, preloadedCooked, cookedId })
      })
    } else {
      navigation.navigate('Cooked', { cookedId })
    }
  }

  const handleImageSlide = useCallback(imageSlideIndex => {
    setCurrentImageIndex(imageSlideIndex)
  }, [])

  // Process photo paths
  const photoUrls = cookedPhotoPaths?.map(path => getCookedPhotoUrl(path))

  return (
    <Animated.View
      ref={cardRef}
      style={[styles.container, containerStyle]}
      //   sharedTransitionTag={'cooked-card-' + cookedId}
    >
      {/* <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={[styles.touchableContainer]}> */}

      {photoUrls && (
        <Animated.View style={photoContainerStyle}>
          {photoSlider ? (
            <PhotoSlider
              images={photoUrls}
              photoStyle={photoStyle}
              onImagePress={handlePress}
              onImageSlide={handleImageSlide}
            />
          ) : (
            photoUrls.map((photoUrl, index) => (
              <Animated.Image
                key={index}
                source={{ uri: photoUrl }}
                style={[styles.photo, photoStyle]}
                resizeMode='cover'
              />
            ))
          )}
        </Animated.View>
      )}

      {renderDragIndicator && renderDragIndicator()}
      {/* </TouchableOpacity> */}

      <Animated.View style={[styles.contents, contentsStyle]}>
        <SocialMenu
          onActionPress={onActionPress}
          profileImage={getProfileImageUrl(cooked['username'])}
          username={cooked['username']}
          date={cooked['cooked-date']}
          showExpandIcon={showExpandIcon}
          showShareIcon={showShareIcon}
          relativeDate={relativeDate}
        />

        <Animated.View style={[styles.body, !cooked['notes'] && { paddingBottom: 0 }, bodyStyle]}>
          {cooked['notes'] && (
            <View style={styles.notes}>
              <Text style={styles.notesText}>{cooked['notes']}</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 0,
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
    backgroundColor: theme.colors.secondary,
    minHeight: 0,
  },
  notesText: {
    fontSize: theme.fontSizes.default,
    lineHeight: 22,
    fontFamily: theme.fonts.ui,
    color: theme.colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.softBlack,
    opacity: theme.opacity.disabled,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 10,
  },
})

export default Card
