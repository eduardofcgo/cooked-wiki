import React, { useCallback, useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { requestPushNotificationsPermission } from '../../notifications/push'

import { PrimaryButton, SecondaryButton, TransparentButton } from '../../components/core/Button'
import ModalCard from '../../components/core/ModalCard'
import { theme } from '../../style/style'

const Notifications = ({ navigation }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0)
  const [previousPhotoIndex, setPreviousPhotoIndex] = React.useState(null)
  const [showSkipModal, setShowSkipModal] = React.useState(false)

  // List of Unsplash photos
  const unsplashPhotos = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
    'https://images.unsplash.com/photo-1547592180-85f173990554',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousPhotoIndex(currentPhotoIndex)
      setCurrentPhotoIndex(prevIndex => (prevIndex + 1) % unsplashPhotos.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPhotoIndex])

  const handleEnableNotifications = useCallback(
    ({ tryAgain = true } = {}) => {
      ; (async () => {
        const { status, canAskAgain } = await requestPushNotificationsPermission()
        if (status === 'denied' && canAskAgain && tryAgain) {
          setShowSkipModal(true)
        } else {
          navigation.navigate('Start')
        }
      })()
    },
    [navigation],
  )

  return (
    <Animated.View style={styles.container} entering={SlideInRight.duration(1000)}>
      <Animated.View style={styles.content}>
        <View style={styles.imagesContainer}>
          {previousPhotoIndex !== null && (
            <Animated.View style={styles.imageWrapper} exiting={SlideOutLeft.duration(500)}>
              <FastImage
                source={{ uri: unsplashPhotos[previousPhotoIndex] }}
                style={[styles.floatingImage, styles.activeImage]}
                resizeMode='cover'
              />
            </Animated.View>
          )}
          <Animated.View style={styles.imageWrapper} entering={SlideInRight.duration(500)}>
            <FastImage
              source={{ uri: unsplashPhotos[currentPhotoIndex] }}
              style={[styles.floatingImage, styles.activeImage]}
              resizeMode='cover'
            />
          </Animated.View>
          <View style={styles.imageOverlayContainer}>
            <Text style={styles.imageOverlayText}>
              <Text style={styles.imageOverlayName}>eduardo</Text> <Text style={styles.imageOverlayTime}>• 1h ago</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Share your cooking with friends.</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            When somebody asks for your pancake recipe, just say:
            <Text style={[styles.description, { color: theme.colors.primary, fontWeight: 'bold' }]}>
              {' '}
              It's on my cooked!
            </Text>
          </Text>

          <Text style={styles.description}>Do you want to know when your friends cook your recipes?</Text>
        </View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <Animated.View style={styles.buttonsContainer} entering={FadeInDown.delay(1000).duration(500)}>
          <PrimaryButton
            title='Notify me'
            onPress={handleEnableNotifications}
            style={styles.nextButton}
            icon={<Icon name='arrow-right' size={20} color='white' />}
          />
          <TransparentButton title='Skip' onPress={() => setShowSkipModal(true)} />
        </Animated.View>
      </View>

      <ModalCard
        visible={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        titleComponent={
          <View style={{ flex: 1, gap: 16, flexDirection: 'row' }}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
          </View>
        }
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>By enabling notifications, you'll be the first to know when:</Text>
          <View style={styles.bulletPoints}>
            <Animated.Text entering={FadeInDown.duration(500).delay(500)} style={styles.bulletPoint}>
              <Icon name='check' size={16} color={theme.colors.primary} /> Friends cook new recipes
            </Animated.Text>
            <Animated.Text entering={FadeInDown.duration(500).delay(1000)} style={styles.bulletPoint}>
              <Icon name='check' size={16} color={theme.colors.primary} /> Someone likes your dishes
            </Animated.Text>
            <Animated.Text entering={FadeInDown.duration(500).delay(1500)} style={styles.bulletPoint}>
              <Icon name='check' size={16} color={theme.colors.primary} /> New people are following you
            </Animated.Text>
          </View>
          <View style={styles.modalButtons}>
            <PrimaryButton
              title='Enable notifications'
              onPress={() => {
                setShowSkipModal(false)
                handleEnableNotifications({ tryAgain: false })
              }}
            />
            <SecondaryButton
              title='Skip anyway'
              onPress={() => {
                setShowSkipModal(false)
                navigation.navigate('Start')
              }}
              style={styles.skipButton}
            />
          </View>
        </View>
      </ModalCard>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((_, index) => (
            <View key={index} style={[styles.dot, index === 2 && styles.activeDot]} />
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  imagesContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    marginBottom: 32,
    marginTop: 64,
    overflow: 'hidden',
  },
  imagesLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    zIndex: 4,
  },
  floatingImage: {
    borderRadius: 12,
    width: '100%',
    height: '100%',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  activeImage: {
    width: '80%',
    height: 180,
    top: 20,
    left: '10%',
    zIndex: 3,
    opacity: 1,
  },
  image1: {
    width: '70%',
    height: 160,
    top: 0,
    left: '5%',
    zIndex: 3,
    opacity: 1,
  },
  image2: {
    width: '65%',
    height: 150,
    top: 40,
    left: '15%',
    zIndex: 2,
    opacity: 0.8,
  },
  image3: {
    width: '60%',
    height: 140,
    top: 75,
    left: '25%',
    zIndex: 1,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  description: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    lineHeight: 24,
    marginBottom: 32,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 8,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row-reverse',
    gap: 8,
    justifyContent: 'space-between',
  },
  skipText: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  footer: {
    paddingBottom: 16,
    backgroundColor: theme.colors.backgroundColor,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  imageOverlayContainer: {
    position: 'absolute',
    bottom: 40,
    left: '15%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 5,
  },
  imageOverlayText: {
    color: 'white',
    fontFamily: theme.fonts.ui,
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageOverlayName: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    fontWeight: 'bold',
  },
  imageOverlayTime: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.8)',
  },
  imageWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  modalContent: {
    paddingTop: 8,
  },
  modalDescription: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    marginBottom: 16,
  },
  bulletPoints: {
    marginBottom: 24,
  },
  bulletPoint: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    marginBottom: 8,
  },
  modalButtons: {
    gap: 8,
  },
  skipButton: {
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    fontSize: theme.fontSizes.large,
  },
})

export default Notifications
