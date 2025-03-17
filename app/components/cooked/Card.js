import { useNavigation } from '@react-navigation/native'
import { toJS } from 'mobx'
import React, { useRef } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'
import SocialMenu from './SocialMenu'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
}) => {
  const navigation = useNavigation()
  const cardRef = useRef(null)

  const cookedId = cooked['id']
  const cookedPhotoPath = cooked['cooked-photos-path']
    ? 'https://cooked.wiki/image/photo/' + cooked['cooked-photos-path'][0]
    : null
  const profilePhoto = 'https://cooked.wiki/user/' + cooked['username'] + '/profile/image'

  const handlePress = () => {
    if (cardRef.current) {
      cardRef.current.measure((x, y, width, height, pageX, pageY) => {
        // For smooth transition, the next screen will know the current position of the card
        const startPosition = { x: pageX, y: pageY, width, height }

        // Also for smoothness, we pass the previously loaded cooked to the Cooked screen.
        // If the cooked screen does not receive this, the standard animation will be used.
        navigation.navigate('Cooked', { startPosition, preloadedCooked: toJS(cooked), cookedId })
      })
    } else {
      navigation.navigate('Cooked', { cookedId })
    }
  }

  return (
    <Animated.View
      ref={cardRef}
      style={[styles.container, containerStyle]}
      //   sharedTransitionTag={'cooked-card-' + cookedId}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={[styles.touchableContainer]}>
        <Animated.View style={photoContainerStyle}>
          <Animated.Image
            source={{ uri: cookedPhotoPath }}
            style={[styles.photo, photoStyle]}
            resizeMode='cover'
            // sharedTransitionTag={'cooked-card-photo-' + cookedId}
          />
        </Animated.View>

        {renderDragIndicator && renderDragIndicator()}
      </TouchableOpacity>

      <Animated.View style={[styles.contents, contentsStyle]}>
        <SocialMenu
          onActionPress={onActionPress}
          profileImage={profilePhoto}
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
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 1,
  },
  contents: {
    transform: [{ translateY: 0 }],
    zIndex: 2,
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
})

export default Card
