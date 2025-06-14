import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import LoadingScreen from '../Loading'
import FullNotes from '../../components/cooked/FullNotes'
import AuthorBar from '../../components/cooked/AuthorBar'
import SocialMenu from '../../components/cooked/SocialMenu'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import ShareNewCookCTA from '../../components/recordcook/ShareCookCTA'

const Image = FastImage

const FreestyleSocialMenu = observer(({ cookedId, onSharePress, onEditPress, username }) => (
  <View style={styles.socialMenuContainer}>
    <SocialMenu cookedId={cookedId} onSharePress={onSharePress} onEditPress={onEditPress} username={username} />
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
  const { cookedId, showShareCTA } = route.params
  const { cookedStore } = useStore()

  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(showShareCTA)

  const photoUrls = cooked?.['cooked-photos-urls']

  const handleShare = useCallback(() => {
    setShouldShowShareCook(false)

    setTimeout(() => {
      navigation.navigate('ShareCooked', { cookedId })
    }, 1)
  }, [cooked])

  const handleDismissShareCTA = useCallback(() => {
    setShouldShowShareCook(false)
  }, [])

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
          <FreestyleSocialMenu
            cookedId={cookedId}
            onSharePress={handleShare}
            onEditPress={cooked?.['username'] === loggedInUsername ? handleEdit : null}
            username={cooked?.['username']}
          />

          {shouldShowShareCook && <ShareNewCookCTA onSharePress={handleShare} onDismissPress={handleDismissShareCTA} />}

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
    justifyContent: 'flex-end', // While we do not have icons at the left
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
