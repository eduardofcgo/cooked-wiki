import { observer } from 'mobx-react-lite'
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useStore } from '../../../context/StoreContext'
import { useEffect, useCallback, useRef, useState } from 'react'
import { theme } from '../../../style/style'
import GenericError from '../../../components/core/GenericError'
import LoadingScreen from '../../Loading'
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons'
import CardSelector from '../../../components/cooked/share/CardSelector'
import { getSavedRecipeUrl, getRecentExtractUrl } from '../../../urls'
import Share from 'react-native-share'
import ENV from '../../../config/environment'

const ShareCooked = observer(() => {
  const route = useRoute()
  const { cookedStore } = useStore()
  const glowAnimation = useRef(new Animated.Value(0)).current
  const cardSelectorRef = useRef(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const { cookedId } = route.params

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const recipeId = cooked?.['recipe-id']
  const extractId = cooked?.['extract-id']
  const cookedRecipeUrl = recipeId
    ? getSavedRecipeUrl(recipeId)
    : extractId
      ? getRecentExtractUrl(extractId)
      : undefined

  const refreshCooked = useCallback(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)

    // Start glow animation
    const startGlowAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
      ).start()
    }

    startGlowAnimation()
  }, [cookedId, cookedStore, glowAnimation])

  const handleInstagramShare = useCallback(async () => {
    if (isCapturing) return

    try {
      setIsCapturing(true)

      // Capture the current card as an image
      if (!cardSelectorRef.current) {
        Alert.alert('Error', 'Unable to capture image. Please try again.')
        return
      }

      const capturedImageUri = await cardSelectorRef.current.captureCurrentCard()

      const shareOptions = {
        social: Share.Social.INSTAGRAM_STORIES,
        appId: ENV.FACEBOOK_APP_ID,
        stickerImage: capturedImageUri,
        backgroundBottomColor: theme.colors.background,
        backgroundTopColor: theme.colors.background,
      }

      await Share.shareSingle(shareOptions)
    } catch (error) {
      if (error.message === 'User did not share' || error.message.includes('User cancelled')) {
        // User cancelled, don't show error
        return
      }
      console.error('Error sharing to Instagram Stories:', error)
      Alert.alert('Error', 'Failed to share to Instagram Stories. Please make sure Instagram is installed.')
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing])

  const handleInstagramDirect = useCallback(async () => {
    if (isCapturing) return

    try {
      setIsCapturing(true)

      if (!cardSelectorRef.current) {
        Alert.alert('Error', 'Unable to capture image. Please try again.')
        return
      }

      const capturedImageUri = await cardSelectorRef.current.captureCurrentCard()
      const message = `Check out what I cooked!${cookedRecipeUrl ? `\n${cookedRecipeUrl}` : ''}`

      const shareOptions = {
        social: Share.Social.INSTAGRAM,
        url: capturedImageUri,
        message,
      }

      await Share.shareSingle(shareOptions)
    } catch (error) {
      if (error.message === 'User did not share' || error.message.includes('User cancelled')) {
        // User cancelled, don't show error
        return
      }
      console.error('Error sharing to Instagram:', error)
      Alert.alert('Error', 'Failed to share to Instagram. Please make sure Instagram is installed.')
    } finally {
      setIsCapturing(false)
    }
  }, [cookedRecipeUrl, isCapturing])

  const handleNativeShare = useCallback(async () => {
    if (isCapturing) return

    try {
      setIsCapturing(true)

      if (!cardSelectorRef.current) {
        Alert.alert('Error', 'Unable to capture image. Please try again.')
        return
      }

      const capturedImageUri = await cardSelectorRef.current.captureCurrentCard()
      const message = `Check out what I cooked!${cookedRecipeUrl ? `\n${cookedRecipeUrl}` : ''}`

      const shareOptions = {
        title: 'Check out what I cooked!',
        message,
        url: capturedImageUri,
        subject: 'Check out what I cooked!', // for email sharing
      }

      await Share.open(shareOptions)
    } catch (error) {
      if (error.message === 'User did not share' || error.message.includes('User cancelled')) {
        // User cancelled, don't show error
        return
      }
      console.error('Error sharing:', error)
      Alert.alert('Error', 'Failed to share. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }, [cookedRecipeUrl, isCapturing])

  if (cookedLoadState === 'rejected') {
    return <GenericError onRetry={refreshCooked} />
  }

  if (cooked === undefined) {
    return <LoadingScreen />
  }

  const animatedGlowStyle = {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.9],
    }),
    shadowRadius: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [25, 45],
    }),
    elevation: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 35],
    }),
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardSelector}>
        <Animated.View style={[styles.sliderContainer, animatedGlowStyle]}>
          <CardSelector ref={cardSelectorRef} cooked={cooked} />
        </Animated.View>
      </View>

      <View style={styles.shareMenuContainer}>
        <Text style={styles.shareMenuTitle}>Share to</Text>

        <View style={styles.shareMenu}>
          <TouchableOpacity
            style={[styles.shareButton, isCapturing && styles.disabledButton]}
            onPress={handleInstagramShare}
            disabled={isCapturing}
          >
            <View style={styles.shareButtonContent}>
              {isCapturing ? (
                <ActivityIndicator size='small' color={theme.colors.softBlack} />
              ) : (
                <MaterialCommunityIcons name='instagram' size={20} color={theme.colors.softBlack} />
              )}
              <Text style={styles.shareButtonText}>Stories</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, isCapturing && styles.disabledButton]}
            onPress={handleInstagramDirect}
            disabled={isCapturing}
          >
            <View style={styles.shareButtonContent}>
              {isCapturing ? (
                <ActivityIndicator size='small' color={theme.colors.softBlack} />
              ) : (
                <MaterialCommunityIcons name='instagram' size={20} color={theme.colors.softBlack} />
              )}
              <Text style={styles.shareButtonText}>Direct</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, isCapturing && styles.disabledButton]}
            onPress={handleNativeShare}
            disabled={isCapturing}
          >
            <View style={styles.shareButtonContent}>
              {isCapturing ? (
                <ActivityIndicator size='small' color={theme.colors.softBlack} />
              ) : (
                <FontAwesome name='paper-plane' size={18} color={theme.colors.softBlack} />
              )}
              <Text style={styles.shareButtonText}>Others</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: `${theme.colors.background}30`,
  },
  cardSelector: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.default,
    resizeMode: 'cover',
  },
  shareMenuContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 100,
    width: '100%',
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  shareMenuTitle: {
    color: theme.colors.black,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    marginBottom: 16,
  },
  shareMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  shareButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  shareButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    textAlign: 'center',
    marginTop: 4,
  },
})

export default ShareCooked
