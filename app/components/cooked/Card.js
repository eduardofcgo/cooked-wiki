import { useNavigation } from '@react-navigation/native'
import React, { useRef } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native'
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
  notes,
  renderDragIndicator,
  photoStyle,
  notesStyle,
  onPressPhoto,
  containerStyle,
  photoContainerStyle,
}) => {
  const navigation = useNavigation()
  const cardRef = useRef(null)

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

      <Animated.View style={[styles.notes, notesStyle]}>
        <Text style={styles.notesText}>{notes}</Text>
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
  notes: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.secondary,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.black,
  },
})

export default Card
