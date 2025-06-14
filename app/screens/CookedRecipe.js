import { observer } from 'mobx-react-lite'
import React, { lazy, useCallback, useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { StyleSheet, View, TouchableOpacity, useWindowDimensions, SafeAreaView, StatusBar } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useStore } from '../context/StoreContext'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import FullNotes from '../components/cooked/FullNotes'
import AuthorBar from '../components/cooked/AuthorBar'
import FeedItem from '../components/cooked/FeedItem'
import SocialMenu from '../components/cooked/SocialMenu'
import ShareNewCookCTA from '../components/recordcook/ShareCookCTA'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import BottomSheet, { BottomSheetFlashList, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import useTryGetSimilarCooks from '../hooks/api/useSimilarCooks'
import Loading from '../components/core/Loading'
import HeaderText from '../components/core/HeaderText'
import DragIndicator from '../components/core/DragIndicator'
import { useAuth } from '../context/AuthContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Image = FastImage

// Recipe which contains the webview can be slow to load
const Recipe = lazy(() => import('./Recipe'))

const BottomSheetHandle = observer(
  ({ username, profileImageUrl, cookedDate, expandCard, toggleCollapse, animatedPosition, absoluteSnapPoints }) => {
    const iconRotationStyle = useAnimatedStyle(() => {
      const animatePoint = absoluteSnapPoints[0] + 300
      const rotation = interpolate(
        animatedPosition.value,
        [animatePoint, animatePoint + 50],
        [180, 0],
        Extrapolate.CLAMP,
      )

      return {
        transform: [{ rotate: `${rotation}deg` }],
      }
    })

    const textOpacityStyle = useAnimatedStyle(() => {
      const animatePoint = absoluteSnapPoints[0] + 300
      const opacity = interpolate(animatedPosition.value, [animatePoint, animatePoint + 50], [1, 0], Extrapolate.CLAMP)

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
          profileImage={profileImageUrl}
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
            <Animated.Text maxFontSizeMultiplier={1.5} style={[styles.showRecipeText, textOpacityStyle]}>
              Show Recipe
            </Animated.Text>
          </TouchableOpacity>
        </AuthorBar>
      </View>
    )
  },
)

const SocialMenuCooked = observer(({ cookedId, onSharePress, onEditPress, username }) => (
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

const ListHeader = observer(
  ({ cookedId, cooked, photoUrls, onShare, shouldShowShareCook, onDismissShareCTA, onEditPress }) => (
    <View style={styles.cardBodyStyle}>
      <FullNotes notes={cooked?.['notes']} />
      <SocialMenuCooked
        cookedId={cookedId}
        onSharePress={onShare}
        onEditPress={onEditPress}
        username={cooked?.['username']}
      />
      {shouldShowShareCook && <ShareNewCookCTA onSharePress={onShare} onDismissPress={onDismissShareCTA} />}
      <PhotoGallery photoUrls={photoUrls} />
      <View style={styles.headerContainer}>
        <HeaderText>Similar Cooked</HeaderText>
      </View>
    </View>
  ),
)

const CookedRecipe = observer(({ navigation, route }) => {
  const { cookedId, showShareCTA } = route.params
  const { cookedStore } = useStore()

  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  const bottomSheetRef = useRef(null)
  const flatListRef = useRef(null)
  const animatedPosition = useSharedValue(0)

  const insets = useSafeAreaInsets()

  useEffect(() => {
    cookedStore.ensureLoaded(cookedId)
  }, [cookedId, cookedStore])

  const cooked = cookedStore.getCooked(cookedId)
  const cookedLoadState = cookedStore.getCookedLoadState(cookedId)

  const [shouldShowShareCook, setShouldShowShareCook] = useState(showShareCTA)
  const [sheetIndex, setSheetIndex] = useState(1)
  const [shouldLoadRecipe, setShouldLoadRecipe] = useState(false)

  const isCardCollapsed = sheetIndex === 0

  const photoUrls = cooked?.['cooked-photos-urls']
  const recipeId = cooked?.['recipe-id']
  const extractId = cooked?.['extract-id']

  const { similarCooks, loadingSimilarCooks, loadNextPage, loadingNextPage, hasMoreSimilarCooks } =
    useTryGetSimilarCooks({ recipeId: recipeId || extractId })

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

  // The Recipe screen uses the navigation params to choose a recipe to open.
  // TODO: refactor out the recipe view from the Recipe screen into a seperate component
  // that can be used on both Recipe and CookedRecipe screens, this way the recipe
  // can be changed via props without needing to do this every time.
  useEffect(() => {
    if (recipeId || extractId) {
      navigation.setParams({
        recipeId: recipeId,
        extractId: extractId,
        queryParams: {},
      })
    }
  }, [recipeId, extractId, navigation])

  // Delay the loading of the recipe webview to avoid lag
  // on the bottom sheet open animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadRecipe(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

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

    StatusBar.setHidden(index > 2 || index < 1, 'fade')

    if (index === 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }, [])

  const handleShareNavigate = useCallback(() => {
    setShouldShowShareCook(false)
    setTimeout(() => {
      navigation.navigate('ShareCooked', { cookedId })
    }, 1)
  }, [cookedId, navigation])

  const handleDismissShareCookCTA = useCallback(() => {
    setShouldShowShareCook(false)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loadingNextPage && hasMoreSimilarCooks) {
      loadNextPage()
    }
  }, [loadingNextPage, hasMoreSimilarCooks, loadNextPage])

  const renderCookedItem = useCallback(
    ({ item: cooked }) => (
      <View style={styles.itemContainer}>
        <FeedItem cooked={cooked} rounded={true} />
      </View>
    ),
    [cooked],
  )

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, [])

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

  const handleEdit = useCallback(() => {
    navigation.navigate('EditCook', { cookedId })
  }, [cookedId, navigation])

  const listHeader = useMemo(
    () => (
      <ListHeader
        cookedId={cookedId}
        cooked={cooked}
        photoUrls={photoUrls}
        onShare={handleShareNavigate}
        shouldShowShareCook={shouldShowShareCook}
        onDismissShareCTA={handleDismissShareCookCTA}
        onEditPress={cooked?.['username'] === loggedInUsername ? handleEdit : null}
      />
    ),
    [cookedId, cooked, photoUrls, handleShareNavigate, loggedInUsername, handleEdit, shouldShowShareCook],
  )

  const renderHandle = () => (
    <BottomSheetHandle
      key={cookedId}
      username={cooked?.['username']}
      profileImageUrl={cooked?.['profile-image-url']}
      cookedDate={cooked?.['cooked-date']}
      isCardCollapsed={isCardCollapsed}
      expandCard={expandCard}
      toggleCollapse={toggleCollapse}
      animatedPosition={animatedPosition}
      absoluteSnapPoints={absoluteSnapPoints}
    />
  )

  if (!cooked || cookedLoadState === 'loading') {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      <View style={{ zIndex: -10, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {shouldLoadRecipe ? (
          <Suspense fallback={<LoadingScreen />}>
            <Recipe
              route={route}
              navigation={navigation}
              cookedCard={bottomSheetRef}
              cookedCardSheetIndex={sheetIndex}
            />
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
        enablePanDownToClose={true}
        handleComponent={renderHandle}
        backgroundStyle={styles.bottomSheetBackground}
        animatedPosition={animatedPosition}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheetShadow}
      >
        <BottomSheetFlashList
          ref={flatListRef}
          data={similarCooks?.slice()}
          renderItem={renderCookedItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          ListFooterComponent={ListFooter}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.flatListContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          initialNumToRender={5}
          windowSize={7}
          extraData={[cooked, cookedId]}
        />
      </BottomSheet>
    </View>
  )
})

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

export default CookedRecipe
