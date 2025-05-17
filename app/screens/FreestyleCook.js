import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import FullNotes from '../components/cooked/FullNotes'
import AuthorBar from '../components/cooked/AuthorBar'
import SocialMenuIcons from '../components/cooked/SocialMenuIcons'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'

const Image = FastImage

const SocialMenu = observer(({ cookedId, onSharePress, onEditPress }) => (
  <View style={styles.socialMenuContainer}>
    {onEditPress ? (
      <TouchableOpacity style={styles.iconContainer} onPress={onEditPress}>
        <MaterialIcons name='edit' size={18} color={`${theme.colors.primary}80`} />
      </TouchableOpacity>
    ) : (
      <View style={styles.iconContainer}>
        <View style={{ width: 18, height: 18 }} />
      </View>
    )}
    <SocialMenuIcons cookedId={cookedId} onSharePress={onSharePress} />
  </View>
))

const PhotoGallery = observer(({ photoUrls }) => {
  if (!photoUrls || photoUrls.length === 0) return null

  return (
    <View style={styles.photoContainer}>
      {photoUrls.map((photoUrl, index) => (
        <Image key={index} source={{ uri: photoUrl }} style={styles.cookedPhoto} resizeMode='cover' loading='lazy' />
      ))}
    </View>
  )
})

const FreestyleCook = ({ navigation, route }) => {
  const { cookedId, showShareModal } = route.params
  const { cookedStore } = useStore()

  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(false)

  const photoUrls = cooked?.['cooked-photos-urls']

  useEffect(() => {
    if (showShareModal) {
      setShouldShowShareCook(true)
    }
  }, [showShareModal])

  const handleShare = useCallback(() => {
    console.log('Sharing cooked item:', cooked)
    setShouldShowShareCook(false)
  }, [cooked])

  const handleEdit = useCallback(() => {
    navigation.navigate('EditCook', { cookedId })
  }, [cookedId, navigation])

  if (!cooked || cookedLoadState === 'loading') {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Cooked without a recipe - freestyle</Text>
        </View>

        <View style={styles.headerContainer}>
          <AuthorBar
            profileImage={cooked?.['profile-image-url']}
            username={cooked?.['username']}
            date={cooked?.['cooked-date']}
            roundedBottom={false}
            backgroundColor={theme.colors.background}
          />
        </View>

        <View style={styles.cardBodyStyle}>
          <FullNotes notes={cooked?.['notes']} />
          <SocialMenu
            cookedId={cookedId}
            onSharePress={handleShare}
            onEditPress={cooked?.['username'] === loggedInUsername ? handleEdit : null}
          />
          <PhotoGallery photoUrls={photoUrls} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  headerContainer: {
    paddingTop: 16,
  },
  headerText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.disabledBackground,
    textAlign: 'center',
  },
  cardBodyStyle: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  socialMenuContainer: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconContainer: {},
  photoContainer: {
    paddingVertical: 16,
  },
  cookedPhoto: {
    backgroundColor: theme.colors.background,
    width: '100%',
    aspectRatio: 1,
  },
})

export default observer(FreestyleCook)
