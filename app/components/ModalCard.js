import React, { useRef, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, PanResponder, Dimensions, StatusBar } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../style/style'
import FadeInStatusBar from './FadeInStatusBar'


export default function ModalCard({ 
  visible, 
  onClose, 
  title,
  titleComponent,
  onShow,
  closeOnOverlay = true,
  children 
}) {
  const screenHeight = Dimensions.get('screen').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const [isHiding, setIsHiding] = useState(false);
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    setIsHiding(true);
    // StatusBar.setBackgroundColor('transparent');
    Animated.parallel([
      Animated.spring(panY, {
        toValue: screenHeight,
        useNativeDriver: true,
        damping: 20,
        mass: 0.8,
        stiffness: 100,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsHiding(false);
      onClose();
    });
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      panY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if(gestureState.dy > 50) {
        handleClose();
      } else {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }).start();
      }
    },
  })).current;

  useEffect(() => {
    if (visible) {
      // StatusBar.setBackgroundColor(theme.colors.primary);
      panY.setValue(screenHeight);
      backgroundOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const translateY = panY.interpolate({
    inputRange: [-screenHeight, 0, screenHeight],
    outputRange: [-screenHeight/4, 0, screenHeight],
  });

  return (
    <Modal
      visible={visible || isHiding}
      transparent={true}
      animationType="none"
      onShow={onShow}
      onRequestClose={handleClose}
    >
      <FadeInStatusBar />
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: backgroundOpacity }
        ]} 
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={closeOnOverlay ? handleClose : undefined}
        >
          <View style={styles.modalContainer} />
        </TouchableOpacity>
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY }] }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <View style={styles.modalHeader}>
            {titleComponent || (
              <Text style={styles.modalTitle}>{title}</Text>
            )}
            {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesomeIcon icon={faXmark} size={15} color={theme.colors.primary} />
            </TouchableOpacity> */}
          </View>
          {children}
        </Animated.View>
      </Animated.View>
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
    width: '200%',
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.default,
    alignSelf: 'center',
    marginBottom: 16,
  },
}) 