import { TimerPickerModal } from 'react-native-timer-picker'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { View } from 'react-native'

export default function Picker({ initialValue, visible, setVisible, onConfirm, onCancel }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TimerPickerModal
        initialValue={initialValue}
        visible={visible}
        setIsVisible={setVisible}
        onConfirm={onConfirm}
        modalTitle='⏰ Set Timer'
        confirmButtonText='Start'
        onCancel={onCancel}
        closeOnOverlayPress
        Audio={Audio}
        Haptics={Haptics}
        styles={{
          backgroundColor: '#efede3',
          text: {
            color: '#292521',
          },
          button: {
            borderRadius: 5,
            borderWidth: 0,
          },
          cancelButton: {
            backgroundColor: 'white',
          },
          confirmButton: {
            color: 'white',
            backgroundColor: '#706b57',
          },
        }}
        modalProps={{
          overlayOpacity: 0.2,
        }}
      />
    </View>
  )
}
