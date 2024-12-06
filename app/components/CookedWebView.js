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

import { useEffect, useRef, useState } from 'react'
import AuthStore from '../auth/store'
import { defaultOnRequest } from '../navigation/webview'
import Loading from './Loading'

export default function CookedWebView({
  startUrl,
  navigation,
  route,
  onLoad,
  onRequest,
}) {
  const webViewRef = useRef()
  const [currentURI, setURI] = useState(startUrl)
  const [cookies, setCookies] = useState(null)

  console.log('CookedWebView', currentURI, cookies)

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
    // webViewRef.current.injectJavaScript(`
    //   window.scroll({
    //     top: 0,
    //     left: 0,
    //     behavior: 'smooth'
    //   })
    // `)
  }

  const refreshWebView = () => {
    webViewRef.current.injectJavaScript(
      `window.location.href = "${startUrl}";
       window.location.reload();`
    )
    webViewRef.current.clearHistory()
    // scrollToTop()
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

  useEffect(() => {
    async function getCredentials() {
      if (cookies === null) {
        const { username, token } = await AuthStore.getCredentials()

        if (token) {
          setCookies(token)
        } else {
          console.log('WebView: Loading without credentials', currentURI)
        }
      }
    }

    getCredentials()
  }, [currentURI])

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
    // If this function returns disableRequest (false value),
    // the WebView will not navigate to this URL.
    const disableRequest = false

    // Always load normally the WebView at the beggining,
    // only further requests will be checked (when the user navigates)
    if (request.url === startUrl) return true

    // Some webpages have native screens, so we always check
    // for the default behaviour.
    const shouldHandleRequestDefault = defaultOnRequest(navigation, request)

    return shouldHandleRequestDefault

    // The default behaviour is not defined for every URL.
    // if (shouldHandleRequestDefault !=== undefined) {
    //   return shouldHandleRequestDefault
    // }

    // If this component received a custom onRequest,
    // it is expected to know how to navigate every URL.
    // else if (onRequest) {
    //   const customHandle = onRequest(request)
    //   if (customHandle === undefined) {
    //     console.error("WebView attempted to navigate to unhandled URL", request.url)

    //     return disableRequest
    //   }
    // }

    // By default do not navigate to unknown URLs
    // else disableRequest
  }

  return (
    <>
      {cookies === null ? (
        <Loading />
      ) : (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            flexDirection: 'column',
            backgroundColor: '#efede3',
          }}>
          <WebView
            source={{
              uri: startUrl,
              headers: {
                Cookie: cookies,
              },
            }}
            onShouldStartLoadWithRequest={request => {
              // If we're loading the current URI, allow it to load
              if (request.url === currentURI) return true
              // We're loading a new URL -- change state first
              setURI(request.url)
              return false
            }}
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
            // only for iOS
            allowsBackForwardNavigationGestures={true}
            // onNavigationStateChange={handleNavigationStateChange}

            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            pullToRefreshEnabled={true}
            startInLoadingState={true}
            renderLoading={Loading}
            ref={webViewRef}
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
      )}
    </>
  )
}
