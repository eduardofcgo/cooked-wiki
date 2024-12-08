import { useEffect, useState } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
} from 'react-native'

import { theme } from '../../style/style'
import CookedButton from '../../components/CookedButton'
import CookedInput from '../../components/CookedInput'
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
} from 'react-native-vision-camera'
import * as ImagePicker from 'expo-image-picker'
import { Camera as CameraIcon, Images as ImagesIcon } from 'lucide-react-native'
import FullScreenCamera from '../../components/FullScreenCamera'

function PickImageButton({ onPicked }) {
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        onPicked(result.assets[0].uri)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <View style={styles.pickImage}>
      <CookedButton onPress={pickImage}>
        <ImagesIcon color='white' size={15} /> Pick from camera roll
      </CookedButton>
    </View>
  )
}

function RequestCameraPermission({ children }) {
  const [denied, setDenied] = useState(false)
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) {
      const accepted = requestPermission()
      setDenied(!accepted)
    }
  }, [hasPermission, denied])

  if (denied) {
    return <Text>Denied Permission</Text>
  } else if (hasPermission) {
    return children
  } else {
    return <Text>Permission Needed</Text>
  }
}

export default function JustCooked({ navigation, route }) {
  const [isFullScreenCameraVisible, setIsFullScreenCameraVisible] =
    useState(false)
  const [imagePath, setImagePath] = useState(null)
  const { hasPermission } = useCameraPermission()
  const device = useCameraDevice('back')

  const openFullScreenCamera = () => {
    setIsFullScreenCameraVisible(true)
  }

  const closeFullScreenCamera = () => {
    setIsFullScreenCameraVisible(false)
  }

  const handleCapture = imagePath => {
    console.log('captured', imagePath)
    setImagePath(imagePath)
  }

  const handlePicked = imagePath => {
    console.log('picked', imagePath)
    setImagePath(imagePath)
  }

  const onUndo = () => {
    setImagePath(null)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.titleText}>
          Just <Text style={styles.primaryText}>cook</Text>
          <Text>ed</Text>
        </Text>
        <Text style={styles.subtitleText}>Showcase your creation.</Text>

        {imagePath ? (
          <CookedInput
            route={route}
            navigation={navigation}
            imagePath={imagePath}
            onUndo={onUndo}></CookedInput>
        ) : (
          <>
            <RequestCameraPermission>
              {device ? (
                <View style={styles.cameraContainer}>
                  <Camera
                    style={styles.camera}
                    device={device}
                    isActive={true}
                    photo={true}
                  />
                  <TouchableOpacity
                    style={styles.overlay}
                    onPress={openFullScreenCamera}>
                    <CameraIcon color='white' size={48} />
                    <Text style={styles.overlayText}>Open camera</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text>Device does not support camera</Text>
              )}
            </RequestCameraPermission>

            <Text style={{ textAlign: 'center', paddingTop: 20 }}>or</Text>

            <PickImageButton onPicked={handlePicked} />

            <View style={styles.bottomSection}>
              <Text style={styles.uiText}>
                Your creation will be published:
              </Text>
              <Text style={styles.uiText}>- On your profile journal.</Text>
              <Text style={styles.uiText}>- On your friends feed.</Text>
              <Text style={styles.uiText}>
                - On similar recipes, inspiring other cooks.
              </Text>
            </View>

            <FullScreenCamera
              isVisible={isFullScreenCameraVisible}
              onClose={closeFullScreenCamera}
              onCapture={handleCapture}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    padding: 25,
    backgroundColor: '#fafaf7',
  },
  uiText: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: 'gray',
  },
  titleText: {
    fontFamily: 'EBGaramond',
    fontSize: 45,
    color: '#292521',
  },
  subtitleText: {
    fontSize: 20,
    fontFamily: 'EBGaramond',
  },
  primaryText: {
    color: '#d97757',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    marginTop: 20,
    borderRadius: theme.borderRadius.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
    color: 'gray',
  },
  fullscreenCamera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  pickImage: {
    paddingTop: 20,
  },
})
