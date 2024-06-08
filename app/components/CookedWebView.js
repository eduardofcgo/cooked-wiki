import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { BackHandler, Platform } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'

import { defaultOnRequest } from '../navigation/navigation'
import { useEffect, useRef, useState } from 'react'

function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fafaf7',
        flexDirection: 'row',
        padding: 10,
      }}>
      <ActivityIndicator color='#d97757' size='large' />
    </View>
  )
}

export default function CookedWebView({
  startUrl,
  navigation,
  route,
  onBeforeLoad,
  onLoad,
}) {
  const webViewRef = useRef()
  const [canGoBack, setCanGoBack] = useState(false)

  const clientLogging = `
    console = new Object();
    console.log = function(log) {
      window.ReactNativeWebView.postMessage(log)
    };
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;`

  const onMessage = payload => {
    //console.log(payload)
  }

  const scrollToTop = () => {
    webViewRef.current.injectJavaScript(`
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    `)
  }

  useEffect(() => {
    const reset = route && route.params && route.params.reset
    const refresh = route && route.params && route.params.refresh

    if (refresh) {
      webViewRef.current.injectJavaScript(
        `window.location.href = "${startUrl}"`
      )
      webViewRef.current.clearHistory()
      scrollToTop()
    }

    if (reset) {
      if (canGoBack)
        webViewRef.current.injectJavaScript(
          `window.location.href = "${startUrl}"`
        )
      else scrollToTop()

      webViewRef.current.clearHistory()
    }
  }, [route])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      webViewRef.current.injectJavaScript(
        'window.closeModals && window.closeModals()'
      )
    })

    return unsubscribe
  })

  const onRequest = request => {
    const canLoad = defaultOnRequest(navigation, request)
    const unhandled = canLoad === undefined

    if (unhandled) {
      if (onBeforeLoad) return onBeforeLoad(request)
      else return true
    } else return canLoad
  }

  const onAndroidBackPress = () => {
    if (canGoBack) {
      webViewRef.current.goBack()
      return true // prevent default behavior (exit app)
    }
    return false
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
      }
    }
  }, [])

  const handleNavigationStateChange = navState => {
    setCanGoBack(navState.canGoBack)

    if (navState.canGoBack) {
      navigation.setOptions({
        headerShown: true,
        headerLeft: props => (
          <HeaderBackButton
            onPress={() => {
              webViewRef.current.goBack()
            }}
          />
        ),
      })
    } else {
      navigation.setOptions({ headerLeft: () => null })
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#efede3',
      }}>
      <WebView
        source={{ uri: startUrl }}
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={clientLogging}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={onRequest}
        onLoad={onLoad}
        nativeConfig={{
          props: {
            webContentsDebuggingEnabled: true,
          },
        }}
        domStorageEnabled={true}
        userAgent={'app'}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        renderLoading={Loading}
      />
    </SafeAreaView>
  )
}
