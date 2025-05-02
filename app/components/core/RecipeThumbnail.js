import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import { absoluteUrl } from '../../urls'

const NoImagePlaceholder = () => <View style={[styles.thumbnail]}></View>

const RecipeThumbnail = observer(({ thumbnailUrl, title }) => {
  return (
    <View style={[styles.container]}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={[styles.thumbnail]} resizeMode='cover' />
      ) : (
        <NoImagePlaceholder />
      )}
      <Text style={[styles.title]} numberOfLines={2}>
        {title}
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
    backgroundColor: theme.colors.background,
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
