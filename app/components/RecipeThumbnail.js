import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/store/StoreContext'
import { theme } from '../style/style'
import { absoluteUrl } from '../urls'

const RecipeThumbnail = observer(({ recipeId, extractId }) => {
  const { recipeMetadataStore } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  const id = recipeId || extractId
  const metadata = recipeMetadataStore.getMetadata(id)

  useEffect(() => {
    if (!recipeId && !extractId) return

    const loadMetadata = async () => {
      setIsLoading(true)
      await recipeMetadataStore.ensureLoadedMetadata(id)
      setIsLoading(false)
    }

    loadMetadata()
  }, [recipeMetadataStore, id])

  if (!metadata || metadata.isLoading) return null

  return (
    <View style={[styles.container]}>
      {isLoading ? (
        <View style={[styles.thumbnail, styles.loadingContainer]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : metadata.thumbnail ? (
        <Image source={{ uri: absoluteUrl(metadata.thumbnail) }} style={[styles.thumbnail]} resizeMode='cover' />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderContainer]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
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
    backgroundColor: theme.colors.lightGrey,
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
