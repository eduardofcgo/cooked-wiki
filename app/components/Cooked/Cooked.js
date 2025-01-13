import React, { useState, useRef, useCallback, memo } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { faPencil } from '@fortawesome/free-solid-svg-icons/faPencil'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import Animated, {
  withSpring,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import { observer } from 'mobx-react-lite'

import { getProfileImageUrl, getPhotoUrl, getThumbnailUrl } from '../../urls'

import { theme } from '../../style/style'
import { PrimaryButton, SecondaryButton } from '../Button'
import Modal from '../Modal'
import Comments from './Comments'
import CommentModal from './CommentModal'

import CookedEdit from './CookedEdit.js'

const WeeksAgo = memo(({ weeks }) => {
  if (weeks === 0) return <Text style={styles.weeksAgo}>This week</Text>
  if (weeks === 1) return <Text style={styles.weeksAgo}>Last week</Text>
  return <Text style={styles.weeksAgo}>{weeks} weeks ago</Text>
})

const LikeButton = memo(({ isLiked, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <FontAwesomeIcon
      icon={isLiked ? faHeartSolid : faHeartRegular}
      size={20}
      color={!isLiked ? theme.colors.primary : '#e86a92'}
    />
  </TouchableOpacity>
))

const EditButton = memo(({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesomeIcon icon={faPencil} size={10} color={theme.colors.primary} style={{ marginRight: 5 }} />
      <Text style={styles.editButton}>Edit</Text>
    </View>
  </TouchableOpacity>
))

const AuthorSection = memo(({ username, onUserPress }) => (
  <TouchableOpacity onPress={onUserPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image source={{ uri: getProfileImageUrl(username) }} style={styles.avatar} />
    <Text style={styles.cookedHeaderText}>{username}</Text>
  </TouchableOpacity>
))

const ImageSection = memo(({ photos, onSingleTap, onDoubleTap, doubleTapRef, heartStyle }) => (
  <View style={styles.imageScrollView} contentContainerStyle={styles.imageScrollViewContent}>
    <TapGestureHandler onHandlerStateChange={onSingleTap} waitFor={doubleTapRef}>
      <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
        <View style={styles.imageContainerNormal}>
          {photos.map((photoPath, index) => (
            <Image
              key={index}
              source={{ uri: getPhotoUrl(photoPath) }}
              style={[styles.mainImage, { width: '100%', height: 300 }]}
              loading='lazy'
              fadeDuration={100}
            />
          ))}
          <Animated.View style={[styles.heartContainer, heartStyle]}>
            <FontAwesomeIcon icon={faHeartSolid} size={80} color='#e86a92' />
          </Animated.View>
        </View>
      </TapGestureHandler>
    </TapGestureHandler>
  </View>
))

const CookedView = observer(({ post, canEdit, hideAuthor, onEdit, onRecipePress, onUserPress, onLike }) => {
  const heartScale = useSharedValue(0)
  const heartOpacity = useSharedValue(0)

  const animatedHeartStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    }),
    []
  )

  const doubleTapRef = useRef(null)

  const onSingleTap = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.ACTIVE) {
        onRecipePress()
      }
    },
    [onRecipePress]
  )

  const onDoubleTap = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.ACTIVE && !post.isLiked) {
        onLike()
        heartScale.value = 0
        heartOpacity.value = 1
        heartScale.value = withSpring(1, { damping: 15 })
        heartOpacity.value = withTiming(0, { duration: 1000 })
      }
    },
    [post.isLiked, onLike, heartScale, heartOpacity]
  )

  return (
    <View style={styles.container}>
      <WeeksAgo weeks={post['weeks-ago']} />

      <View style={styles.cookedCard}>
        <View style={styles.authorContainer}>
          {!hideAuthor && (
            <>
              <AuthorSection username={post.username} onUserPress={onUserPress} />
              <Text style={styles.separator}>•</Text>
            </>
          )}
          <TouchableOpacity style={[styles.recipeNameContainer]} onPress={onRecipePress}>
            <Text style={[styles.cookedHeaderText, styles.recipeNameText]} numberOfLines={2}>
              {post['recipe-title']}
            </Text>
            <FontAwesomeIcon icon={faChevronRight} size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollContent}>
          {post['cooked-photos-path']?.length > 0 ? (
            <ImageSection
              photos={post['cooked-photos-path']}
              onSingleTap={onSingleTap}
              onDoubleTap={onDoubleTap}
              doubleTapRef={doubleTapRef}
              heartStyle={animatedHeartStyle}
            />
          ) : (
            <View style={styles.compactViewContainer}>
              {post['recipe-image-path'] && (
                <Image source={{ uri: getThumbnailUrl(post['recipe-image-path']) }} style={styles.thumbnailImage} />
              )}
              {post.notes?.length > 0 && (
                <View style={styles.compactDescription}>
                  <Text style={styles.description}>{post.notes}</Text>
                </View>
              )}
            </View>
          )}

          {post['cooked-photos-path']?.length > 0 && post.notes?.length > 0 && (
            <View style={styles.viewContainer}>
              <Text style={styles.description}>{post.notes}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {canEdit ? <EditButton onPress={onEdit} /> : <View />}
            <LikeButton isLiked={post.isLiked} onPress={onLike} />
          </View>
        </View>
      </View>
    </View>
  )
})

const Cooked = observer(({ post, canEdit, onRecipePress, onUserPress, hideAuthor }) => {
  const [isEditing, setIsEditing] = useState(false)

  const handleClose = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleEdit = useCallback(() => setIsEditing(true), [])
  const handleLike = useCallback(() => {
    /* Handle like */
  }, [])

  return (
    <>
      <CookedView
        post={post}
        canEdit={canEdit}
        hideAuthor={hideAuthor}
        onEdit={handleEdit}
        onRecipePress={onRecipePress}
        onUserPress={onUserPress}
        onLike={handleLike}
      />
      <Modal visible={isEditing} onClose={handleClose} title='Edit cook'>
        <CookedEdit post={post} close={handleClose} />
      </Modal>
    </>
  )
})

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.secondary,
  },
  modalHeader: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cookedCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: theme.colors.white,
    marginVertical: 16,
  },
  scrollContent: {
    flex: 1,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: theme.colors.white,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 16,
    marginRight: 10,
  },
  cookedHeaderText: {
    color: theme.colors.black,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
  },
  editTitle: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
  },
  mainImage: {
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  mainImageViewing: {
    width: '100%',
    height: 300,
  },
  mainImageEditing: {
    width: 150,
    height: 150,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
  },
  editButton: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
  },
  description: {
    flex: 1,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
  },
  editContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    backgroundColor: theme.colors.secondary,
  },
  editInput: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    borderWidth: 1,
    borderColor: theme.colors.softBlack,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
  },
  imageScrollView: {
    flexGrow: 0,
  },
  imageScrollViewContent: {
    width: '100%',
  },
  imageScrollEditContent: {
    marginLeft: 15,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  imageContainerNormal: {
    position: 'relative',
  },
  imageContainerEditing: {
    marginRight: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainerViewing: {
    width: '100%',
  },
  excludeButton: {
    position: 'absolute',
    top: '40%',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  excludeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.default,
  },
  addImageButton: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.default,
  },
  addImageText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.default,
  },
  viewContainer: {
    padding: 15,
    backgroundColor: theme.colors.secondary,
    minHeight: 50,
  },
  recipeLabel: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    marginRight: 10,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeThumb: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 10,
  },
  recipeTitle: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    color: theme.colors.primary,
  },
  separator: {
    marginHorizontal: 8,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.default,
  },
  recipeNameText: {
    flex: 1,
    ellipsizeMode: 'tail',
  },
  recipeNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  compactViewContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    minHeight: 100,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.default,
    marginRight: 15,
  },
  compactDescription: {
    flex: 1,
  },
  weeksAgo: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    paddingHorizontal: 15,
  },
})

export default Cooked
