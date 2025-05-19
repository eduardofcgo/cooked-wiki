import Login from '../Login'
import HowItWorks from '../onboarding/HowItWorks'
import Notifications from '../onboarding/Notifications'
import OnboardingScreen from '../onboarding/Onboarding'
import Start from '../onboarding/Start'
import SetupUsername from '../onboarding/SetupUsername'

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
        name='SetupUsername'
        options={{
          headerShown: false,
        }}
        component={SetupUsername}
      />

      <StackNavigator.Screen
        name='OnboardingNotifications'
        options={{
          headerShown: false,
        }}
        component={Notifications}
      />

      <StackNavigator.Screen name='Start' component={Start} options={{ title: 'Start', headerShown: false }} />

      <StackNavigator.Screen name='Login' component={Login} options={{ title: 'Login', ...screenStyle }} />
    </>
  )
}
