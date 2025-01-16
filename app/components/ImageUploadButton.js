import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { theme } from '../style/style'
import Loading from './Loading'

const ImageUploadButton = ({ onPress, isUploading }) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    disabled={isUploading}
  >
    <View style={[styles.content]}>
      {isUploading ? (
        <Loading />
      ) : (
        <>
          <FontAwesomeIcon 
            icon={faCamera} 
            size={24} 
            color={theme.colors.softBlack} 
          />
          <Text style={styles.text}>
            Add photo
          </Text>
        </>
      )}
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  button: {
    width: 110,
    height: 110,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  text: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
  },
})

export default ImageUploadButton 