import { createNativeStackNavigator } from '@react-navigation/native-stack'

import LoggedInStack from './LoggedInStack'
import OnboardingStack from './OnboardingStack'
import { useAuth } from '../../context/AuthContext'

import { theme, screenStyle } from '../../style/style'
import { IconButton } from 'react-native-paper'

const StackNavigator = createNativeStackNavigator()

const defaultScreenOptions = ({ navigation }) => ({
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

export default function Navigator() {
  const { loggedIn } = useAuth()

  const loggedInStack = LoggedInStack({ StackNavigator })
  const onboardingStack = OnboardingStack({ StackNavigator })

  return (
    <StackNavigator.Navigator initialRouteName={loggedIn ? 'Main' : 'Onboarding'} screenOptions={defaultScreenOptions}>
      {loggedIn ? loggedInStack : onboardingStack}
    </StackNavigator.Navigator>
  )
}
