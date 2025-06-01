import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { captureRef } from 'react-native-view-shot'
import * as FileSystem from 'expo-file-system'
import SinglePhotoCard from './cards/SinglePhotoCard'
import RecipeViewPhotoCard from './cards/RecipeViewPhotoCard'
import TwoPhotoCard from './cards/TwoPhotoCard'
import { theme } from '../../../style/style'
import { observer } from 'mobx-react-lite'

const CardSelector = observer(
  forwardRef(({ cooked }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)
    const flashListRef = useRef(null)
    const cardRefs = useRef({})

    const hasRecipe = cooked['recipe-id'] || cooked['extract-id']

    const cards =
      cooked['cooked-photos-urls']?.length > 0
        ? [
            {
              id: 'two',
            },
            {
              id: 'single',
            },
            ...(hasRecipe
              ? [
                  {
                    id: 'recipe',
                  },
                ]
              : []),
          ]
        : [
            ...(hasRecipe
              ? [
                  {
                    id: 'recipe',
                  },
                ]
              : []),
            {
              id: 'single',
            },
          ]

    useImperativeHandle(
      ref,
      () => ({
        captureCurrentCard: async () => {
          const currentCardId = cards[currentIndex]?.id
          const currentCardRef = cardRefs.current[currentCardId]

          if (currentCardRef) {
            try {
              const tempUri = await captureRef(currentCardRef, {
                format: 'jpg',
                quality: 0.9,
                result: 'tmpfile',
                height: 1920,
                width: 1080,
              })

              const recipeTitle =
                cooked['recipe-title'] || cooked['extract-title'] || cooked['title'] || 'Cooked Recipe'

              const cleanTitle = recipeTitle
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 30)
              const filename = `${cleanTitle}.jpg`

              const newUri = `${FileSystem.documentDirectory}${filename}`

              await FileSystem.copyAsync({
                from: tempUri,
                to: newUri,
              })

              try {
                await FileSystem.deleteAsync(tempUri)
              } catch (deleteError) {
                console.warn('Could not delete temp file:', deleteError)
              }

              return newUri
            } catch (error) {
              console.error('Error capturing card:', error)
              throw error
            }
          }
          throw new Error('No card reference found')
        },
        getCurrentCardType: () => cards[currentIndex]?.id,
      }),
      [currentIndex, cooked],
    )

    const handleLayout = useCallback(event => {
      const { width } = event.nativeEvent.layout
      setSliderWidth(width)
    }, [])

    const onScroll = useCallback(
      event => {
        const contentOffset = event.nativeEvent.contentOffset.x
        const newIndex = Math.round(contentOffset / sliderWidth)
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex)
        }
      },
      [currentIndex, sliderWidth],
    )

    const handleDotPress = useCallback(
      index => {
        if (flashListRef.current && sliderWidth > 0) {
          flashListRef.current.scrollToIndex({
            index,
            animated: true,
          })
        }
        setCurrentIndex(index)
      },
      [sliderWidth],
    )

    const renderItem = useCallback(
      ({ item }) => {
        let CardComponent

        switch (item.id) {
          case 'two':
            CardComponent = (
              <View ref={ref => (cardRefs.current[item.id] = ref)} style={styles.cardWrapper}>
                <TwoPhotoCard cooked={cooked} />
              </View>
            )
            break
          case 'single':
            CardComponent = (
              <View ref={ref => (cardRefs.current[item.id] = ref)} style={styles.cardWrapper}>
                <SinglePhotoCard cooked={cooked} />
              </View>
            )
            break
          case 'recipe':
            CardComponent = (
              <View ref={ref => (cardRefs.current[item.id] = ref)} style={styles.cardWrapper}>
                <RecipeViewPhotoCard cooked={cooked} />
              </View>
            )
            break
          default:
            CardComponent = null
        }

        return <View style={[styles.cardContainer, { width: sliderWidth }]}>{CardComponent}</View>
      },
      [sliderWidth, cooked],
    )

    const keyExtractor = useCallback(item => item.id, [])

    return (
      <View style={styles.container} onLayout={handleLayout}>
        {sliderWidth > 0 && (
          <View style={styles.cardsContainer}>
            <FlashList
              ref={flashListRef}
              data={cards}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              estimatedItemSize={sliderWidth}
            />
          </View>
        )}

        <View style={styles.dotsContainer}>
          {cards.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </View>
    )
  }),
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
  },
  cardContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    backgroundColor: `${theme.colors.softBlack}40`,
  },
  cardTitle: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
    marginTop: 12,
    textAlign: 'center',
  },
})

export default CardSelector
