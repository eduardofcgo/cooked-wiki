import { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStore } from '../context/store/StoreContext'
import BottomTabs from '../components/BottomTabs'
import { requestPushNotificationsPermission, registerPushNotificationToken } from '../notifications/push'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function Main() {
  const { userStore } = useStore();

  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(undefined);
  
  const notificationListener = useRef();
  const responseListener = useRef();
  const tokenListener = useRef();

  useEffect(() => {
    requestPushNotificationsPermission().then(permission => {
      if (permission.status === 'granted') {
        registerPushNotificationToken().then(token => {
          if (token) {
            userStore.setNotificationToken(token);
          }
        })
      }
    });

    tokenListener.current = Notifications.addPushTokenListener(token => {
      userStore.setNotificationToken(token.data);
    });

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
      tokenListener.current &&
        Notifications.removeNotificationSubscription(tokenListener.current);
    };
  }, []);
    
  return <BottomTabs />
}

export default observer(Main)
