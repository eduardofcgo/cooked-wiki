import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import { absoluteUrl } from '../../urls'

const NoImagePlaceholder = () => (
  <View style={[styles.thumbnail, styles.placeholderContainer]}>
    <Text style={styles.placeholderText}>No Image</Text>
  </View>
)

const RecipeThumbnail = observer(({ recipeId, extractId }) => {
  const { recipeMetadataStore } = useStore()

  const id = recipeId || extractId
  const metadata = recipeMetadataStore.getMetadata(id)

  useEffect(() => {
    if (!recipeId && !extractId) return
    ;(async () => {
      await recipeMetadataStore.ensureLoadedMetadata(id)
    })()
  }, [recipeMetadataStore, id])

  if (!metadata || metadata.isLoading) return null

  return (
    <View style={[styles.container]}>
      {metadata.thumbnail ? (
        <Image source={{ uri: absoluteUrl(metadata.thumbnail) }} style={[styles.thumbnail]} resizeMode='cover' />
      ) : (
        <NoImagePlaceholder />
      )}
      <Text style={[styles.title]} numberOfLines={2}>
        {metadata.title}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 110,
    height: 110,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSizes.default,
    textAlign: 'center',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  loadingContainer: {
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    backgroundColor: theme.colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.grey,
    fontSize: theme.fontSizes.small,
  },
})

export default RecipeThumbnail
