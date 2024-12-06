import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import { useCameraDevice, Camera } from 'react-native-vision-camera'
import { X as XIcon, Zap as FlashIcon } from 'lucide-react-native'

export default function FullScreenCamera({ isVisible, onClose, onCapture }) {
  const device = useCameraDevice('back')
  const camera = useRef(null)
  const [flash, setFlash] = useState('off')

  const screenWidth = Dimensions.get('window').width
  const cameraSize = screenWidth

  useEffect(() => {
    if (isVisible) {
      StatusBar.setHidden(true, 'fade')
    }
    return () => {
      StatusBar.setHidden(false, 'fade')
    }
  }, [isVisible])

  const capturePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        flash: flash,
        qualityPrioritization: 'quality',
      })
      onCapture(photo.path)
      onClose()
    }
  }

  const toggleFlash = () => {
    setFlash(prevFlash => {
      switch (prevFlash) {
        case 'off':
          return 'on'
        case 'on':
          return 'auto'
        case 'auto':
          return 'off'
        default:
          return 'off'
      }
    })
  }

  const cameraStyle = useMemo(
    () => ({
      width: cameraSize,
      height: cameraSize,
    }),
    [cameraSize]
  )

  if (!device) return null

  return (
    <Modal visible={isVisible} animationType='slide' statusBarTranslucent>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.cameraContainer}>
            <Camera
              ref={camera}
              style={cameraStyle}
              device={device}
              isActive={true}
              photo={true}
            />
          </View>
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={onClose} style={styles.topButton}>
              <XIcon color='white' size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFlash} style={styles.topButton}>
              <FlashIcon color='white' size={24} />
              <Text style={styles.flashText}>{flash.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              onPress={capturePhoto}
              style={styles.captureButton}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50, // Increased top padding
    zIndex: 2,
  },
  topButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
})
