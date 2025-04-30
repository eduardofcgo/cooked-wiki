import { observer } from 'mobx-react-lite'
import React, { lazy, useCallback, useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { Dimensions, StyleSheet, View, Image, TouchableOpacity, Text, useWindowDimensions } from 'react-native'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import FullNotes from '../components/cooked/FullNotes'
import { getCookedPhotoUrl, getProfileImageUrl } from '../urls'
import AuthorBar from '../components/cooked/AuthorBar'
import FeedItem from '../components/cooked/FeedItem'
import SocialMenuIcons from '../components/cooked/SocialMenuIcons'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import useTryGetSimilarCooks from '../hooks/services/useSimilarCooks'
import Loading from '../components/core/Loading'
import HeaderText from '../components/core/HeaderText'
import DragIndicator from '../components/core/DragIndicator'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

// Square photo height, adjust photo to fit the screen
const PHOTO_HEIGHT = SCREEN_HEIGHT - SCREEN_WIDTH

// Recipe which contains the webview can be slow to load
// Making sure that it does not make the card animation lag.
const Recipe = lazy(() => import('./Recipe'))

const BottomSheetHandle = observer(
  ({ username, cookedDate, expandCard, toggleCollapse, animatedPosition, absoluteSnapPoints }) => {
    const iconRotationStyle = useAnimatedStyle(() => {
      const rotation = interpolate(
        animatedPosition.value,
        [absoluteSnapPoints[1], absoluteSnapPoints[1] + 50],
        [180, 0],
        Extrapolate.CLAMP,
      )

      return {
        transform: [{ rotate: `${rotation}deg` }],
      }
    })

    const textOpacityStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animatedPosition.value,
        [absoluteSnapPoints[1], absoluteSnapPoints[1] + 50],
        [1, 0],
        Extrapolate.CLAMP,
      )

      return {
        opacity,
      }
    })

    return (
      <View style={styles.handleHeader}>
        <View style={styles.dragIndicatorContainer}>
          <DragIndicator />
        </View>
        <AuthorBar
          onExpandPress={expandCard}
          profileImage={getProfileImageUrl(username)}
          username={username}
          date={cookedDate}
          roundedBottom={false}
          backgroundColor={theme.colors.background}
        >
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={toggleCollapse}
            hitSlop={{ top: 20, bottom: 20, left: 100, right: 20 }}
          >
            <Animated.View style={iconRotationStyle}>
              <MaterialIcons name='keyboard-arrow-up' size={25} color={theme.colors.primary} />
            </Animated.View>
            <Animated.Text style={[styles.showRecipeText, textOpacityStyle]}>Show Recipe</Animated.Text>
          </TouchableOpacity>
        </AuthorBar>
      </View>
    )
  },
)

const SocialMenu = observer(({ cookedId, onSharePress }) => (
  <View style={styles.socialMenuContainer}>
    <TouchableOpacity style={styles.iconContainer}>
      <MaterialIcons name='edit' size={18} color={`${theme.colors.primary}80`} />
    </TouchableOpacity>
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

// MemoizedListHeader component extracted from the main component
const ListHeader = observer(({ cookedId, cooked, photoUrls, handleShare }) => (
  <View style={styles.cardBodyStyle}>
    <FullNotes notes={cooked?.['notes']} />
    <SocialMenu cookedId={cookedId} onSharePress={handleShare} />
    <PhotoGallery photoUrls={photoUrls} />
    <View style={styles.headerContainer}>
      <HeaderText>Similar Cooked</HeaderText>
    </View>
  </View>
))

const CookedRecipe = ({ navigation, route }) => {
  const { cookedId, showShareModal } = route.params
  const { cookedStore } = useStore()

  const bottomSheetRef = useRef(null)
  const flatListRef = useRef(null)
  const animatedPosition = useSharedValue(0)

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(false)
  const [sheetIndex, setSheetIndex] = useState(1)
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  // Compute isCardCollapsed based on sheetIndex
  const isCardCollapsed = sheetIndex === 0

  const cookedPhotoPaths = cooked?.['cooked-photos-path']
  const recipeId = cooked?.['recipe-id']
  const extractId = cooked?.['extract-id']

  // Get similar cooks data
  const { similarCooks, loadingSimilarCooks, loadNextPage, loadingNextPage, hasMoreSimilarCooks } =
    useTryGetSimilarCooks({ recipeId: recipeId || extractId })

  // TODO: move to the store and server
  const photoUrls = useMemo(() => cookedPhotoPaths?.map(path => getCookedPhotoUrl(path)), [cookedPhotoPaths])

  const snapPoints = useMemo(() => [105, '70%', '90%'], [])

  const windowHeight = useWindowDimensions().height

  const absoluteSnapPoints = useMemo(
    () =>
      snapPoints.map(snapPoint => {
        if (typeof snapPoint === 'string') {
          const percentValue = snapPoint.replace('%', '')
          return windowHeight * (parseInt(percentValue, 10) / 100)
        }
        return snapPoint
      }),
    [snapPoints, windowHeight],
  )

  // Delay the loading of the recipe webview to avoid lag
  // on the bottom sheet open animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadRecipe(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showShareModal) {
      setShouldShowShareCook(true)
    }
  }, [showShareModal])

  const toggleCollapse = useCallback(() => {
    if (isCardCollapsed) {
      bottomSheetRef.current?.snapToIndex(1)
    } else {
      bottomSheetRef.current?.snapToIndex(0)
    }
  }, [isCardCollapsed])

  const expandCard = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1)
  }, [])

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.7}
        style={[props.style]}
        pressBehavior={0}
        onPress={() => {
          if (!isCardCollapsed) {
            toggleCollapse()
          }
        }}
      />
    ),
    [isCardCollapsed, toggleCollapse],
  )

  const handleSheetChanges = useCallback(index => {
    setSheetIndex(index)

    if (index === 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }, [])

  // Placeholder function for sharing
  const handleShare = useCallback(() => {
    console.log('Sharing cooked item:', cooked)
    setShouldShowShareCook(false)
  }, [cooked])

  // Handle load more similar cooks
  const handleLoadMore = useCallback(() => {
    if (!loadingNextPage && hasMoreSimilarCooks) {
      loadNextPage()
    }
  }, [loadingNextPage, hasMoreSimilarCooks, loadNextPage])

  // Render similar cooked item
  const renderCookedItem = useCallback(
    ({ item: cooked }) => (
      <View style={styles.itemContainer}>
        <FeedItem cooked={cooked} rounded={true} />
      </View>
    ),
    [],
  )

  // Key extractor for FlatList
  const keyExtractor = useCallback(item => item.id, [])

  // FlatList footer component
  const ListFooter = useMemo(() => {
    if (loadingNextPage) {
      return (
        <View style={styles.loadingMore}>
          <Loading size='small' backgroundColor='transparent' />
        </View>
      )
    }
    return null
  }, [loadingNextPage])

  const memoizedListHeader = useMemo(
    () => <ListHeader cookedId={cookedId} cooked={cooked} photoUrls={photoUrls} handleShare={handleShare} />,
    [cookedId, cooked, photoUrls, handleShare],
  )

  // Custom handle component for the bottom sheet
  const renderHandle = useCallback(
    () => (
      <BottomSheetHandle
        key={cookedId}
        username={cooked?.['username']}
        cookedDate={cooked?.['cooked-date']}
        isCardCollapsed={isCardCollapsed}
        expandCard={expandCard}
        toggleCollapse={toggleCollapse}
        animatedPosition={animatedPosition}
        absoluteSnapPoints={absoluteSnapPoints}
      />
    ),
    [
      cookedId,
      cooked?.['username'],
      cooked?.['cooked-date'],
      isCardCollapsed,
      expandCard,
      toggleCollapse,
      animatedPosition,
      absoluteSnapPoints,
    ],
  )

  if (!cooked || cookedLoadState === 'loading') {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <View style={{ zIndex: -10, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {shouldLoadRecipe ? (
          <Suspense fallback={<LoadingScreen />}>
            <Recipe recipeId={recipeId} extractId={extractId} route={route} navigation={navigation} />
          </Suspense>
        ) : (
          <LoadingScreen />
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={1}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleComponent={renderHandle}
        backgroundStyle={styles.bottomSheetBackground}
        animatedPosition={animatedPosition}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheetShadow}
      >
        <BottomSheetFlatList
          ref={flatListRef}
          data={similarCooks}
          renderItem={renderCookedItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          ListHeaderComponent={memoizedListHeader}
          contentContainerStyle={styles.flatListContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          initialNumToRender={5}
          windowSize={7}
        />
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.background,
  },
  bottomSheetShadow: {
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 12,
  },
  flatListContent: {
    paddingBottom: 50,
  },
  cardBodyStyle: {
    paddingHorizontal: 16,
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
  showRecipeText: {
    marginLeft: 5,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
  },
  handleHeader: {
    paddingVertical: 8,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 16,
    marginTop: 16,
  },
  similarCooksHeader: {
    textAlign: 'center',
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
  },
  itemContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  loadingMore: {
    padding: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
})

export default observer(CookedRecipe)
