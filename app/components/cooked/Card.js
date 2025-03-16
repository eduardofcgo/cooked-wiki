import { useNavigation } from '@react-navigation/native'
import React, { useRef } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { theme } from '../../style/style'
import SocialMenu from './SocialMenu'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const Card = ({
  photoUri,
  profileImage,
  username,
  date,
  showExpandIcon,
  showShareIcon,
  onActionPress,
  renderDragIndicator,
  photoStyle,
  notesStyle,
  onPressPhoto,
  containerStyle,
  photoContainerStyle,
  bodyStyle,
}) => {
  const navigation = useNavigation()
  const cardRef = useRef(null)

  //   const notes =
  //     'I added a bit more garlic than the recipe called for and used fresh herbs from my garden. The dish turned out amazing! Next time I might try adding some red pepper flakes for a bit of heat.'
  const notes = 'amazing'

  const handlePress = () => {
    if (cardRef.current) {
      cardRef.current.measure((x, y, width, height, pageX, pageY) => {
        const startPosition = { x: pageX, y: pageY, width, height }
        navigation.navigate('Cooked', { startPosition })
      })
    } else {
      navigation.navigate('Cooked')
    }
  }

  return (
    <Animated.View ref={cardRef} style={[styles.container, containerStyle]} sharedTransitionTag='card'>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <Animated.View style={photoContainerStyle}>
          <Animated.Image
            source={{ uri: photoUri }}
            style={[styles.photo, photoStyle]}
            resizeMode='cover'
            sharedTransitionTag='tag'
          />
        </Animated.View>

        {renderDragIndicator && renderDragIndicator()}
      </TouchableOpacity>

      <SocialMenu
        onActionPress={onActionPress}
        profileImage={profileImage}
        username={username}
        date={date}
        showExpandIcon={showExpandIcon}
        showShareIcon={showShareIcon}
      />

      <Animated.View style={[styles.body, bodyStyle]}>
        <View style={styles.notes}>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 0,
    // overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.secondary,
    minHeight: 0,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.black,
  },
})

export default Card
