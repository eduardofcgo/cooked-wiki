import React, { useEffect, useState, useRef } from 'react'
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { theme } from '../../style/style'
import DragIndicator from './DragIndicator'

export default function ModalCard({
  visible,
  onClose,
  onAfterClose,
  title,
  titleComponent,
  onShow,
  closeOnOverlay = true,
  children,
  disableContentUpdateAnimation = false,
}) {
  const screenHeight = Dimensions.get('screen').height
  const translateY = useSharedValue(screenHeight)
  const [isHiding, setIsHiding] = useState(false)
  const opacity = useSharedValue(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [childrenKey, setChildrenKey] = useState(0)
  const [titleKey, setTitleKey] = useState(0)
  const [prevChildren, setPrevChildren] = useState(null)
  const [prevTitle, setPrevTitle] = useState(null)
  const [prevTitleComponent, setPrevTitleComponent] = useState(null)
  const [isInitialMount, setIsInitialMount] = useState(true)
  const [currentVisible, setCurrentVisible] = useState(visible)

  // Handle children changes
  useEffect(() => {
    if (currentVisible) {
      if (isInitialMount) {
        // First time the modal is visible, update children without incrementing key
        setPrevChildren(children)
        setIsInitialMount(false)
      } else if (children !== prevChildren && !disableContentUpdateAnimation) {
        // If content changes and animations are enabled, increment key to trigger animation
        setPrevChildren(children)
        setChildrenKey(prev => prev + 1)
      } else if (children !== prevChildren) {
        // If content changes but animations are disabled, just update reference
        setPrevChildren(children)
      }
    }
  }, [children, currentVisible, disableContentUpdateAnimation, isInitialMount])

  // Handle title changes (keep original behavior)
  useEffect(() => {
    if (currentVisible && (title !== prevTitle || titleComponent !== prevTitleComponent)) {
      setPrevTitle(title)
      setPrevTitleComponent(titleComponent)
      setTitleKey(prev => prev + 1)
    }
  }, [title, titleComponent, currentVisible])

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height)
      },
    )

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      },
    )

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])

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
        if (onAfterClose) {
          runOnJS(onAfterClose)()
        }
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
    // Reset initial mount flag when modal opens again
    setIsInitialMount(true)
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
            [-screenHeight / 4, 0, screenHeight],
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
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.modalContainer, backgroundStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeOnOverlay ? handleClose : undefined}
          >
            <View style={styles.modalContainer} />
          </TouchableOpacity>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={10}
            style={styles.keyboardAvoidingContainer}
          >
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.modalContent, animatedStyle]}>
                <DragIndicator />
                <View style={styles.modalHeader}>
                  <Animated.View key={titleKey} entering={FadeIn.duration(300)} style={styles.titleContainer}>
                    {titleComponent || <Text style={styles.modalTitle}>{title}</Text>}
                  </Animated.View>
                </View>
                <Animated.View
                  key={childrenKey}
                  // Not sure why, android cannot animate this, and just flashes the contents...
                  entering={Platform.OS !== 'android' ? FadeIn.duration(500).delay(300) : undefined}
                  style={styles.childrenContainer}
                >
                  {children}
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          </KeyboardAvoidingView>
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
    zIndex: 900,
  },
  modalContent: {
    borderRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.background,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
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
  keyboardAvoidingContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  childrenContainer: {
    width: '100%',
  },
  titleContainer: {
    flex: 1,
  },
})
