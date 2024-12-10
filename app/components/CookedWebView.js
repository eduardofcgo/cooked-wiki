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
  disableRefresh,
  disableBottomMargin
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
    if (!disableRefresh) {
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
      } else if (message.type === 'refresh') {        
        refreshWebView();
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

    // Add pull-to-refresh detection
    let touchStartY = 0;
    let touchEndY = 0;
    const THRESHOLD = 150; // Minimum pull distance to trigger refresh
    const MAX_PULL = 200; // Maximum pull distance for visual feedback

    // Create or get the content wrapper
    function getContentWrapper() {
      let wrapper = document.getElementById('pull-to-refresh-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'pull-to-refresh-wrapper';
        wrapper.style.transition = 'transform 0.2s';
        // Wrap the body contents
        while (document.body.firstChild) {
          wrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(wrapper);
      }
      return wrapper;
    }

    document.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
      getContentWrapper().style.transition = 'none';
    }, false);

    document.addEventListener('touchmove', function(e) {
      if (window.scrollY === 0) {
        touchEndY = e.touches[0].clientY;
        const pullDistance = touchEndY - touchStartY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          // Apply transform with damping effect
          const damping = 0.4;
          const movement = Math.min(pullDistance * damping, MAX_PULL);
          getContentWrapper().style.transform = \`translateY(\${movement}px)\`;
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', function() {
      if (window.scrollY === 0) {
        const pullDistance = touchEndY - touchStartY;
        
        // Smoothly animate back to original position
        getContentWrapper().style.transition = 'transform 0.2s';
        getContentWrapper().style.transform = 'translateY(0)';
        
        if (pullDistance > THRESHOLD) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'refresh',
            pullDistance: pullDistance
          }));
        }
      }
      // Reset values
      touchStartY = 0;
      touchEndY = 0;
    }, false);

    // Existing message handling code
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
    });`;
  
  const onLoad = e => {
    console.log('onLoad', e.nativeEvent.url)
  }

  return (
    <SafeAreaView 
      style={{ 
        flex: 1,
      }}
    >
      {!credentials ? (
        <LoadingScreen
          backgroundColor={theme.colors.background} />
      ) : (
        <>
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
              // Optional: add bottom margin if needed
              marginBottom: 0
            }}
            onLoad={onLoad}
            // onLoadEnd={onLoadEnd}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            javaScriptEnabled={true}
          />
          {isRefreshing && (
            <ActivityIndicator
              style={{
                borderRadius: 50,
                backgroundColor: theme.colors.background,
                position: 'absolute',
                top: 20,
                alignSelf: 'center',
                zIndex: 1000,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                padding: 5,
              }}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </>
      )}
    </SafeAreaView>
  )
}
