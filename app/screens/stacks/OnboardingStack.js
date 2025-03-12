import OnboardingScreen from '../Onboarding'
import Start from '../Start'
import Login from '../Login'
import Register from '../Register'

import { screenStyle } from '../../style/style'

export default function OnboardingStack({ StackNavigator }) {
  return (
    <>
      <StackNavigator.Screen name='Onboarding' options={{ headerShown: false }} component={OnboardingScreen} />

      <StackNavigator.Screen name='Start' component={Start} options={{ title: 'Start', headerShown: false }} />

      <StackNavigator.Screen name='Login' component={Login} options={{ title: 'Login', ...screenStyle }} />

      <StackNavigator.Screen name='Register' component={Register} options={{ title: 'Register', ...screenStyle }} />
    </>
  )
}
