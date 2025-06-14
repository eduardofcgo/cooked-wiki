import { observer } from 'mobx-react-lite'
import React, { useCallback, useRef, useState, useMemo, Suspense } from 'react'
import { StyleSheet, View, TouchableOpacity, useWindowDimensions, StatusBar } from 'react-native'
import FastImage from 'react-native-fast-image'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import BottomSheet, { BottomSheetFlashList, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { theme } from '../../style/style'
import Loading from '../core/Loading'
import HeaderText from '../core/HeaderText'
import DragIndicator from '../core/DragIndicator'
import FullNotes from '../cooked/FullNotes'
import AuthorBar from '../cooked/AuthorBar'
import FeedItem from '../cooked/FeedItem'
import SocialMenu from '../cooked/SocialMenu'
import ShareNewCookCTA from '../recordcook/ShareCookCTA'

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
        <FastImage
          key={index}
          source={{ uri: photoUrl }}
          style={styles.cookedPhoto}
          resizeMode='cover'
          loading='lazy'
        />
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

const DragHandle = observer(
  ({ cookedId, cooked, isCardCollapsed, expandCard, toggleCollapse, animatedPosition, absoluteSnapPoints }) => {
    return (
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
  },
)

const RecipeCookedSheet = observer(
  ({
    cooked,
    cookedId,
    similarCooks,
    loadingNextPage,
    hasMoreSimilarCooks,
    loadNextPage,
    onShare,
    onEdit,
    shouldShowShareCook,
    onDismissShareCTA,
    loggedInUsername,
    navigation,
  }) => {
    const bottomSheetRef = useRef(null)
    const flatListRef = useRef(null)
    const animatedPosition = useSharedValue(0)
    const [sheetIndex, setSheetIndex] = useState(1)

    const isCardCollapsed = sheetIndex === 0
    const photoUrls = cooked?.['cooked-photos-urls']

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

    const HandleComponent = useMemo(() => {
      return React.memo(() => (
        <DragHandle
          cookedId={cookedId}
          cooked={cooked}
          isCardCollapsed={isCardCollapsed}
          expandCard={expandCard}
          toggleCollapse={toggleCollapse}
          animatedPosition={animatedPosition}
          absoluteSnapPoints={absoluteSnapPoints}
        />
      ))
    }, [cookedId, cooked, isCardCollapsed, expandCard, toggleCollapse, absoluteSnapPoints])

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
      [],
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

    const listHeader = useMemo(
      () => (
        <ListHeader
          cookedId={cookedId}
          cooked={cooked}
          photoUrls={photoUrls}
          onShare={onShare}
          shouldShowShareCook={shouldShowShareCook}
          onDismissShareCTA={onDismissShareCTA}
          onEditPress={cooked?.['username'] === loggedInUsername ? onEdit : null}
        />
      ),
      [cookedId, cooked, photoUrls, onShare, loggedInUsername, onEdit, shouldShowShareCook],
    )

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={1}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        handleComponent={HandleComponent}
        backgroundStyle={styles.bottomSheetBackground}
        animatedPosition={animatedPosition}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheetShadow}
      >
        <BottomSheetFlashList
          ref={flatListRef}
          data={similarCooks?.slice()}
          estimatedItemSize={50}
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
    )
  },
)

const styles = StyleSheet.create({
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
    justifyContent: 'flex-end',
  },
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
  headerContainer: {
    marginBottom: 16,
    marginTop: 16,
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

export default RecipeCookedSheet
