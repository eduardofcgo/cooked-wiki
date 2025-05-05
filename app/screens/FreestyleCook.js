import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import FullNotes from '../components/cooked/FullNotes'
import { getCookedPhotoUrl, getProfileImageUrl } from '../urls'
import AuthorBar from '../components/cooked/AuthorBar'
import SocialMenuIcons from '../components/cooked/SocialMenuIcons'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'

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

  const cookedPhotoPaths = cooked?.['cooked-photos-path']

  const photoUrls = useMemo(() => cookedPhotoPaths?.map(path => getCookedPhotoUrl(path)), [cookedPhotoPaths])

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
          <AuthorBar
            profileImage={getProfileImageUrl(cooked?.['username'])}
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
    borderRadius: theme.borderRadius.default,
  },
})

export default observer(FreestyleCook)
