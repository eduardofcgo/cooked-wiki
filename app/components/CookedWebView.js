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
        backgroundColor: '#fafaf7',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flex: 1,
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
  onRequest
}) {
  const webViewRef = useRef()
  const [currentUrl, setCurrentUrl] = useState(startUrl)

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

  // const onMessage = payload => {
  //   //console.log(payload)
  // }

  const scrollToTop = () => {
    webViewRef.current.injectJavaScript(`
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    `)
  }

  const refreshWebView = () => {
    webViewRef.current.injectJavaScript(
      `window.location.href = "${startUrl}";
       window.location.reload();`
    )
    webViewRef.current.clearHistory()
    scrollToTop()  
  }


  // useEffect(() => {
  //   console.log('refresh effect')

  //   // const reset = route && route.params && route.params.reset
  //   const refresh = route && route.params && route.params.refresh

  //   console.log('refresh', refresh)

  //   if (refresh) {
  //     webViewRef.current.injectJavaScript(
  //       `window.location.href = "${startUrl}";
  //        window.location.reload();`
  //     )
  //     webViewRef.current.clearHistory()
  //     scrollToTop()
  //   }

  //   // if (reset) {
  //   //   if (canGoBack)
  //   //     webViewRef.current.injectJavaScript(
  //   //       `window.location.href = "${startUrl}"`
  //   //     )
  //   //   else scrollToTop()

  //   //   webViewRef.current.clearHistory()
  //   // }
  // }, [route])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      webViewRef.current.injectJavaScript(
        'window.closeModals && window.closeModals()'
      )
    })

    return unsubscribe
  })

  useEffect(() => {
    const refresh = route.params && route.params.refresh

    if (refresh) {
      refreshWebView()
    }
  }, [route.params])

  const handleNavigationStateChange = navState => {
    setCanGoBack(navState.canGoBack)

    if (navState.canGoBack) {
      navigation.setOptions({
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

  const onWebViewRequest = request => {
    if (request.url === startUrl)
      return true

    if (onRequest !== undefined)
      return onRequest(request)
    
    else 
      return false
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        backgroundColor: '#efede3',
      }}>
      <WebView
        source={{ uri: startUrl }}
        ref={webViewRef}

        // injectedJavaScript={clientLogging}
        // onMessage={onMessage}
        onShouldStartLoadWithRequest={onWebViewRequest}
        // onLoad={onLoad}
        nativeConfig={{
          props: {
            webContentsDebuggingEnabled: true,
          },
        }}
        userAgent={'app'}


        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={handleNavigationStateChange}


        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}       
        startInLoadingState={true}

        renderLoading={Loading}
        //The background color when loading
        style={{ 
          backgroundColor: '#fafaf7',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          flex: 1,
          // marginBottom: 60,
         }}
      />
    </SafeAreaView>
  )
}
