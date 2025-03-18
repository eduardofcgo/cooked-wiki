import React, { useEffect, useState } from 'react'
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '../../style/style'
// import FadeInStatusBar from './FadeInStatusBar'

export default function ModalCard({
  visible,
  onClose,
  title,
  titleComponent,
  onShow,
  closeOnOverlay = true,
  children,
}) {
  const screenHeight = Dimensions.get('screen').height
  const translateY = useSharedValue(screenHeight)
  const [isHiding, setIsHiding] = useState(false)
  const opacity = useSharedValue(0)

  const [currentVisible, setCurrentVisible] = useState(visible)

  const handleClose = () => {
    setIsHiding(true)
    translateY.value = withSpring(screenHeight, {
      damping: 15,
      mass: 1.5,
      stiffness: 60,
    })
    opacity.value = withTiming(0, { duration: 500 }, finished => {
      if (finished) {
        runOnJS(setIsHiding)(false)
        runOnJS(setCurrentVisible)(false)
        runOnJS(onClose)()
      }
    })
  }

  const handleOpen = () => {
    translateY.value = screenHeight
    opacity.value = 0
    translateY.value = withSpring(0, {
      damping: 20,
      mass: 0.8,
      stiffness: 100,
    })
    opacity.value = withTiming(1, { duration: 200 })

    setCurrentVisible(true)
  }

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY
    },
    onEnd: event => {
      if (event.translationY > 50) {
        runOnJS(handleClose)()
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        })
      }
    },
  })

  useEffect(() => {
    if (!visible && currentVisible) {
      handleClose()
    }

    if (visible && !currentVisible) {
      handleOpen()
    }
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [-screenHeight, 0, screenHeight],
            [-screenHeight / 4, 0, screenHeight]
          ),
        },
      ],
    }
  })

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  return (
    <Modal
      visible={currentVisible || isHiding}
      transparent={true}
      animationType='none'
      onShow={onShow}
      onRequestClose={handleClose}>
      {/* <FadeInStatusBar /> */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.modalContainer, backgroundStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeOnOverlay ? handleClose : undefined}>
            <View style={styles.modalContainer} />
          </TouchableOpacity>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.modalContent, animatedStyle]}>
              <View style={styles.dragIndicator} />
              <View style={styles.modalHeader}>{titleComponent || <Text style={styles.modalTitle}>{title}</Text>}</View>
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.disabledBackground,
  },
  modalContent: {
    borderRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.background,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'left',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.default,
    alignSelf: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
})
