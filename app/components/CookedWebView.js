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

import { useEffect, useRef, useState, useContext } from 'react'
import AuthStore from '../auth/store'
import { defaultOnRequest } from '../navigation/webview'
import Loading from './Loading'
import LoadingScreen from '../screens/Loading'
import { AuthContext } from '../context/auth'

export default function CookedWebView({
  startUrl,
  navigation,
  route,
  onRequest,
}) {
  const webViewRef = useRef()
  
  const auth = useContext(AuthContext)
  const { credentials } = auth
  const { token } = credentials

  const [currentURI, setURI] = useState(startUrl)

  const [canGoBack, setCanGoBack] = useState(false)

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
    // webViewRef.current.injectJavaScript(
    //   `window.location.href = "${startUrl}";
    //    window.location.reload();`
    // )
    // webViewRef.current.clearHistory()
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

  const handleMessage = (event) => {
    const data = event.nativeEvent.data

    try {
      const message = JSON.parse(data);
      if (message.type === 'logged-user') {
        if (message.username === undefined) {
          console.error('Logged user is undefined, this should not happen')
        
        } else if (message.username === null) {
          console.log('Logged user is null, logging out', currentURI)

          auth.logout()
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const injectedJavaScript = `
    console = new Object();
    console.log = function(log) {
      window.ReactNativeWebView.postMessage(log)
    };
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;

    const message = {
      type: 'logged-user',
      username: undefined
    }

    const serverTimingEntries = performance.getEntriesByType('navigation')
    
    if (serverTimingEntries && serverTimingEntries.length > 0) {
      const serverTiming = serverTimingEntries[0].serverTiming;

      if (serverTiming && serverTiming.length > 0) {
        const loggedUserEntry = serverTiming.find(entry => entry.name === 'Logged-User');
        const username = loggedUserEntry?.description;
        message.username = username === "null" ? null : username
      }
    }

    window.ReactNativeWebView.postMessage(JSON.stringify(message))

    document.addEventListener('htmx:afterOnLoad', function(event) {
      const loggedUserMessage = {
        type: 'logged-user',
        username: undefined
      }

      const loggedUserHeader = event.detail.xhr.getResponseHeader('X-Logged-User');

      if (loggedUserHeader) {
        loggedUserMessage.username = loggedUserHeader === "null" ? null : loggedUserHeader;
      }
      window.ReactNativeWebView.postMessage(JSON.stringify(loggedUserMessage));
    });
    `;
  
    const onLoad = e => {
      console.log('onLoad', e.nativeEvent.url)
    }

  return (
    <>
      {!credentials ? (
        <LoadingScreen
          backgroundColor={theme.colors.background} />
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
              uri: startUrl + `?ring-session=${encodeURIComponent(token)}`,
            }}
            onShouldStartLoadWithRequest={request => {
              console.log('request', request.url)

              // If we're loading the current URI, allow it to load
              if (request.url === currentURI) return true
              // We're loading a new URL -- change state first
              setURI(request.url)
              return false
            }}
            onShouldStartLoadWithRequest={onWebViewRequest}
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
            thirdPartyCookiesEnabled={Platform.OS === 'android'} // Only needed for Android
            incognito={false}
            cacheEnabled={true}

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
            onLoad={onLoad}
            // onLoadEnd={onLoadEnd}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            // Make sure JavaScript is enabled
            javaScriptEnabled={true}
          />
        </SafeAreaView>
      )}
    </>
  )
}
