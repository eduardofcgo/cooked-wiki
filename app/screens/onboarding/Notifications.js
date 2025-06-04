import React, { useCallback, useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import FastImage from 'react-native-fast-image'
import moment from 'moment'

import { usePushNotification } from '../../context/PushNotificationContext'

import { PrimaryButton, SecondaryButton, TransparentButton } from '../../components/core/Button'
import ModalCard from '../../components/core/ModalCard'
import { theme } from '../../style/style'
import { getPublicCommunityJournalUrl } from '../../urls'

const Notifications = ({ navigation }) => {
  // TODO: for now even if already has permission, will show this screen anyway
  const { hasPermission, requestPermission } = usePushNotification()

  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0)
  const [previousPhotoIndex, setPreviousPhotoIndex] = React.useState(null)
  const [showSkipModal, setShowSkipModal] = React.useState(false)
  const [journalData, setJournalData] = React.useState([])

  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        const response = await fetch(getPublicCommunityJournalUrl(), {
          headers: {
            Accept: 'application/json',
          },
        })
        const data = await response.json()
        setJournalData(data.results || [])

        const imagesToPreload = data.results
          ?.map(entry => entry['cooked-photos-urls']?.[0])
          .filter(Boolean)
          .map(url => ({ uri: url }))

        if (imagesToPreload.length > 0) {
          FastImage.preload(imagesToPreload)
        }
      } catch (error) {
        console.error('Error fetching journal data:', error)
      }
    }

    fetchJournalData()
  }, [])

  useEffect(() => {
    if (journalData.length === 0) return

    const interval = setInterval(() => {
      setPreviousPhotoIndex(currentPhotoIndex)
      setCurrentPhotoIndex(prevIndex => (prevIndex + 1) % journalData.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPhotoIndex, journalData])

  const handleEnableNotifications = useCallback(async () => {
    const allowed = await requestPermission()
    // Apple seems to not want this modal
    // if (!allowed) {
    //   setShowSkipModal(true)
    // } else {
    navigation.navigate('Start')
    // }
  }, [navigation, requestPermission])

  const handleSkip = useCallback(async () => {
    setShowSkipModal(false)
    navigation.navigate('Start')
  }, [navigation])

  const handleEnableNotificationsSkipModal = useCallback(async () => {
    await requestPermission()
    setShowSkipModal(false)
    navigation.navigate('Start')
  }, [navigation, requestPermission])

  const handleDisableNotificationsSkipModal = useCallback(async () => {
    setShowSkipModal(false)
    navigation.navigate('Start')
  }, [navigation])

  return (
    <Animated.View style={styles.container} entering={SlideInRight.duration(1000)}>
      <Animated.View style={styles.content}>
        <View style={styles.imagesContainer}>
          {previousPhotoIndex !== null && (
            <Animated.View style={styles.imageWrapper} exiting={SlideOutLeft.duration(500)}>
              <FastImage
                source={{ uri: journalData[previousPhotoIndex]?.['cooked-photos-urls']?.[0] }}
                style={[styles.floatingImage, styles.activeImage]}
                resizeMode='cover'
              />
            </Animated.View>
          )}
          <Animated.View style={styles.imageWrapper} entering={SlideInRight.duration(500)}>
            <FastImage
              source={{ uri: journalData[currentPhotoIndex]?.['cooked-photos-urls']?.[0] }}
              style={[styles.floatingImage, styles.activeImage]}
              resizeMode='cover'
            />
          </Animated.View>
          <View style={styles.imageOverlayContainer}>
            <View style={styles.imageOverlayText}>
              <Text allowFontScaling={false} style={styles.imageOverlayName}>
                {journalData[currentPhotoIndex]?.username}
              </Text>
              <Text allowFontScaling={false} style={styles.imageOverlayTime}>
                {moment(journalData[currentPhotoIndex]?.['cooked-date']).fromNow()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Share your cooking with friends.</Text>

        <View style={styles.descriptionContainer}>
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
          <TransparentButton title='Skip' onPress={handleSkip} />
        </Animated.View>
      </View>

      <ModalCard
        visible={showSkipModal}
        disableContentUpdateAnimation={true}
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
            <PrimaryButton title='Enable notifications' onPress={handleEnableNotificationsSkipModal} />
            <SecondaryButton
              title='Skip anyway'
              onPress={handleDisableNotificationsSkipModal}
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
    height: 300,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  activeImage: {
    width: 250,
    height: 250,
    top: 25,
    left: '50%',
    marginLeft: -125,
    zIndex: 3,
    opacity: 1,
  },
  image1: {
    width: 220,
    height: 220,
    top: 0,
    left: '50%',
    marginLeft: -110,
    zIndex: 3,
    opacity: 1,
  },
  image2: {
    width: 200,
    height: 200,
    top: 50,
    left: '50%',
    marginLeft: -100,
    zIndex: 2,
    opacity: 0.8,
  },
  image3: {
    width: 180,
    height: 180,
    top: 100,
    left: '50%',
    marginLeft: -90,
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
    textAlign: 'center',
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
    backgroundColor: theme.colors.background,
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
    bottom: 35,
    left: '50%',
    transform: [{ translateX: -115 }],
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 5,
    maxWidth: '80%',
  },
  imageOverlayText: {
    gap: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayName: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
  },
  imageOverlayTime: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    fontWeight: 'normal',
    color: theme.colors.softBlack,
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
