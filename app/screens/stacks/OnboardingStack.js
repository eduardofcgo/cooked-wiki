import Login from '../Login'
import HowItWorks from '../Onboarding/HowItWorks'
import Notifications from '../Onboarding/Notifications'
import OnboardingScreen from '../Onboarding/Onboarding'
import Start from '../Onboarding/Start'
import Register from '../Register'

import { screenStyle } from '../../style/style'

export default function OnboardingStack({ StackNavigator }) {
  return (
    <>
      <StackNavigator.Screen
        name='Onboarding'
        options={{
          headerShown: false,
        }}
        component={OnboardingScreen}
      />

      <StackNavigator.Screen
        name='HowItWorks'
        options={{
          headerShown: false,
        }}
        component={HowItWorks}
      />

      <StackNavigator.Screen
        name='Notifications'
        options={{
          headerShown: false,
        }}
        component={Notifications}
      />

      <StackNavigator.Screen name='Start' component={Start} options={{ title: 'Start', headerShown: false }} />

      <StackNavigator.Screen name='Login' component={Login} options={{ title: 'Login', ...screenStyle }} />

      <StackNavigator.Screen name='Register' component={Register} options={{ title: 'Register', ...screenStyle }} />
    </>
  )
}
