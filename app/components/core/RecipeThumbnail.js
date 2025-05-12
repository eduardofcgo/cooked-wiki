import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'

const NoImagePlaceholder = () => <View style={[styles.thumbnail]}></View>

const RecipeThumbnail = observer(({ thumbnailUrl, title, type }) => {
  return (
    <View style={[styles.container]}>
      <View style={{ position: 'relative' }}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={[styles.thumbnail]} resizeMode='cover' />
        ) : (
          <NoImagePlaceholder />
        )}
        {type !== 'saved' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>
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
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.softBlack,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: theme.fonts.uiBold,
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
