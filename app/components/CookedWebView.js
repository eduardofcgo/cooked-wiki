import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { BackHandler, Platform, ScrollView, Dimensions, RefreshControl } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'

import { useEffect, useRef, useState, useContext } from 'react'
import AuthStore from '../auth/store'
import { theme } from '../style/style'
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

  const [currentURI, setURI] = useState(startUrl + `?token=${token}`)

  const [height, setHeight] = useState(Dimensions.get('screen').height);
  const [isRefreshing, setRefreshing] = useState(false);


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
    setRefreshing(true)

    webViewRef.current.injectJavaScript(
      `window.location.href = "${startUrl}";`
    )
    webViewRef.current.clearHistory()
    // scrollToTop()

    // For now, we are not waiting for the load event.
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
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
    // Always load normally the WebView at the beggining,
    // only further requests will be checked - when the user navigates
    if (request.url === startUrl) return true

    // Default navigation
    const shouldHandleRequestDefault = defaultOnRequest(navigation, request)

    return shouldHandleRequestDefault
  }

  const handleMessage = (event) => {
    const data = event.nativeEvent.data

    try {
      const message = JSON.parse(data);
      if (message.type === 'logged-user') {
        if (message.username === undefined) {
          console.log('Logged user is undefined, this should not happen')
        
        } else if (message.username === null) {
          console.log('Logged user is null, logging out', currentURI)

          auth.logout()
        }
      } else if (message.type === 'refreshed') {
        setRefreshing(false)
      } else if (message.type === 'scroll') {        
        if (message.startPosition == 0 && message.endPosition === 0) {
          refreshWebView();
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

    let scrollStartPosition = 0;
    
    document.addEventListener('touchstart', function(e) {
      scrollStartPosition = window.scrollY;
    }, false);

    document.addEventListener('touchend', function(e) {
      const currentPosition = window.scrollY;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'scroll',
        startPosition: scrollStartPosition,
        endPosition: currentPosition
      }));
    }, false);
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
        <ScrollView
          style={{
            flex: 1,
            height: '100%',
            backgroundColor: theme.colors.background,
          }}
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              enabled={false}
              tintColor={theme.colors.primary}
              progressBackgroundColor={theme.colors.background}
              colors={[theme.colors.primary]}
            />
          }          
          >
          <WebView 
            source={{
              uri: currentURI,
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
              backgroundColor: theme.colors.background,
              justifyContent: 'flex-start',
              flexDirection: 'column',
              flex: 1,
              height: height,
            }}
            onLoad={onLoad}
            // onLoadEnd={onLoadEnd}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            javaScriptEnabled={true}
          />
        </ScrollView>
      )}
    </>
  )
}
