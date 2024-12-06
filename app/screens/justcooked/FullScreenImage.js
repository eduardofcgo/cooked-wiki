import React from 'react'
import { View, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { X as XIcon } from 'lucide-react-native'

const FullScreenImage = ({ route, navigation }) => {
  const { imagePath } = route.params

  const onClose = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imagePath }}
            style={styles.image}
            resizeMode='contain'
          />
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={onClose} style={styles.topButton}>
            <XIcon color='white' size={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 50,
    zIndex: 2,
  },
  topButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default FullScreenImage
