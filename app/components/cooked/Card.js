import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, ScrollView, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import FullNotes from './FullNotes'
import Notes from './Notes'
import PhotoSlider from './PhotoSlider'
import AuthorBar from './AuthorBar'
import { observer } from 'mobx-react-lite'
import SocialMenu from './SocialMenu'
import { useAuth } from '../../context/AuthContext'

const Image = FastImage

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const Card = ({ cooked, collapseNotes, showCookedWithoutNotes, showRecipe }) => {
  const navigation = useNavigation()
  const { credentials } = useAuth()

  const canEdit = credentials?.username === cooked['username']

  const cookedId = cooked['id']
  const photoUrls = cooked['cooked-photos-urls']
  const recipePhotoUrl = cooked['recipe-photo-url']
  const recipeId = cooked['recipe-id']
  const extractId = cooked['extract-id']

  const hasRecipe = Boolean(recipeId || extractId)

  const { profileStore } = useStore()

  const socialMenuContainerRef = useRef(null)

  const navigateToCookedScreen = useCallback(() => {
    if (!hasRecipe) {
      navigation.push('FreestyleCook', { cookedId })
    } else {
      // For smooth screen transition, we pass the current position
      // on the screen for the Cooked screen card to open from.

      socialMenuContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const startPosition = pageY - height

        navigation.push('CookedRecipe', { cookedId, startPosition })
      })
    }
  }, [cookedId, hasRecipe])

  const navigateToRecipe = useCallback(() => {
    navigation.navigate('Recipe', { recipeId: cooked['recipe-id'], extractId: cooked['extract-id'] })
  }, [cooked])

  const onDoubleTapPhoto = useCallback(() => {
    profileStore.likeCooked(cookedId)
  }, [cookedId, profileStore])

  const navigateToEditCook = useCallback(() => {
    navigation.navigate('EditCook', { cookedId })
  }, [cookedId])

  return (
    <View
      style={[
        styles.container,
        ((!photoUrls?.length && !showRecipe) || !showRecipe || (!recipePhotoUrl && !showRecipe)) && {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      ]}
    >
      {!photoUrls?.length && showRecipe && recipePhotoUrl && (
        <TouchableOpacity onPress={navigateToRecipe}>
          <Image source={{ uri: recipePhotoUrl }} style={styles.recipePhoto} />
        </TouchableOpacity>
      )}

      {photoUrls && photoUrls.length > 0 && (
        <PhotoSlider
          images={photoUrls}
          cookedId={cookedId}
          onDoubleTap={onDoubleTapPhoto}
          imageStyle={
            (!hasRecipe || !showRecipe) && {
              borderTopLeftRadius: theme.borderRadius.default,
              borderTopRightRadius: theme.borderRadius.default,
            }
          }
        />
      )}

      <View style={[styles.contents]}>
        <View ref={socialMenuContainerRef}>
          <AuthorBar
            profileImage={cooked['profile-image-url']}
            username={cooked['username']}
            date={cooked['cooked-date']}
            roundedTop={!cooked['notes']}
            roundedBottom={!cooked['notes']}
          >
            <SocialMenu
              cookedId={cookedId}
              onSharePress={undefined}
              onEditPress={canEdit ? navigateToEditCook : undefined}
            />
          </AuthorBar>
        </View>

        <View style={[styles.body, !cooked['notes'] && { paddingBottom: 0 }]}>
          {collapseNotes ? (
            <Notes
              notes={cooked['notes']}
              showCookedWithoutNotes={showCookedWithoutNotes}
              navigateToCookedScreen={navigateToCookedScreen}
            />
          ) : (
            <FullNotes notes={cooked['notes']} showCookedWithoutNotes={showCookedWithoutNotes} />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: theme.borderRadius.default,
    borderBottomRightRadius: theme.borderRadius.default,
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
    borderBottomLeftRadius: theme.borderRadius.default,
    borderBottomRightRadius: theme.borderRadius.default,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.softBlack,
    opacity: theme.opacity.disabled,
  },
  recipePhoto: {
    width: 110,
    height: 110,
    marginLeft: 16,
    borderRadius: theme.borderRadius.default,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 10,
  },
  photoBelow: {
    width: '100%',
    aspectRatio: 1,
    zIndex: 10,
  },
})

export default observer(Card)
