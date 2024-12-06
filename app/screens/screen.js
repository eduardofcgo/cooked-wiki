import { theme, screenStyle } from '../style/style'
import { IconButton } from 'react-native-paper'

export const defaultScreenOptions = ({ navigation }) => ({
  ...screenStyle,
  headerLeft: () => (
    <IconButton
      icon='arrow-left'
      size={20}
      style={{ margin: 0, marginLeft: -10 }}
      color={theme.colors.black}
      onPress={() => navigation.goBack()}
    />
  ),
})
