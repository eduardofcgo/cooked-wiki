import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { NavigationContainer } from '@react-navigation/native'
import { usePushNotification } from '../context/PushNotificationContext'
import { navigationTheme } from '../style/navigation'
import linking from './linking'
import LoadingScreen from '../screens/Loading'

export default observer(function ({ children }) {
  const { getInitialNotification, onNotificationOpenedApp } = usePushNotification()

  const memoizedLinking = useMemo(
    () => linking({ getInitialNotification, onNotificationOpenedApp }),
    [getInitialNotification, onNotificationOpenedApp],
  )

  return (
    <NavigationContainer fallback={<LoadingScreen />} linking={memoizedLinking} theme={navigationTheme}>
      {children}
    </NavigationContainer>
  )
})
