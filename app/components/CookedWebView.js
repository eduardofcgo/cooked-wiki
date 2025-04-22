import { Dimensions, Platform, SafeAreaView, Text, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'

export default function CookedWebView({
  startUrl,
  navigation,
  route,
  onRequest,
  onRequestPath,
  disableRefresh,
  disableBottomMargin,
  loadingComponent,
  dynamicHeight,
  onHeightChange,
  disableScroll,
  style,
}) {
  const webViewRef = useRef()
  const [isWebViewReady, setIsWebViewReady] = useState(false)

  const auth = useAuth()
  const { credentials } = auth
  const { token } = credentials

  const [currentURI, setURI] = useState(startUrl + `?token=${token}`)

  const [height, setHeight] = useState(Dimensions.get('screen').height)
  const [isRefreshing, setRefreshing] = useState(false)

  const [canGoBack, setCanGoBack] = useState(false)

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

      webViewRef.current.injectJavaScript(`window.location.href = "${startUrl}";`)
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
      webViewRef.current.injectJavaScript('window.closeModals && window.closeModals()')
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
    const { url } = request
    // console.log(`[WebView] onShouldStartLoadWithRequest: Intercepted URL = ${url}`)

    // Allow the initial load URL explicitly
    const initialUri = startUrl + `?token=${token}`
    if (url === initialUri) {
      // console.log(`[WebView] onShouldStartLoadWithRequest: Allowing initial load URL.`)
      return true
    }

    // Also allow the base startUrl in case of redirects that clean the token
    if (url === startUrl) {
      // console.log(`[WebView] onShouldStartLoadWithRequest: Allowing base start URL.`)
      return true
    }

    // Previous logic for specific path handling
    if (onRequestPath) {
      console.log(`[WebView] onShouldStartLoadWithRequest: URL not allowed directly, checking onRequestPath.`)
      setTimeout(() => {
        const pathname = new URL(url).pathname
        onRequestPath(pathname)
      }, 1)
    }

    console.log(`[WebView] onShouldStartLoadWithRequest: Blocking URL.`)
    return false // Block other navigations
  }

  const handleMessage = event => {
    const data = event.nativeEvent.data

    // First, check if it's a height message (simple number string)
    const height = parseInt(data)
    if (!isNaN(height) && dynamicHeight && onHeightChange) {
      // It's a height message
      if (height > 0) {
        // Ensure height is positive
        onHeightChange(height)
      }
      return // Don't try to parse as JSON
    }

    // Otherwise, try parsing as JSON for other messages
    try {
      const message = JSON.parse(data)
      if (message.type === 'logged-user') {
        if (message.username === undefined) {
          console.warn('Logged user is undefined, this should not happen')
        } else if (message.username === null) {
          console.log('Logged user is null, logging out', currentURI)

          auth.logout()
        }
      } else if (message.type === 'refresh') {
        refreshWebView()
      }
    } catch (error) {
      console.log('Error parsing message:', error)
      console.log('Received non-JSON, non-height message from WebView:', data) // Log if parsing failed
    }
  }

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
    });`

  // Combine injected JS for existing functionality and dynamic height
  const combinedInjectedJavaScript = `
    ${injectedJavaScript} // Existing JS

    // Dynamic Height Calculation (only if dynamicHeight is enabled)
    ${
      dynamicHeight
        ? `
      let lastHeight = 0;
      const postHeight = () => {
        const currentHeight = document.body.scrollHeight;
        if (currentHeight !== lastHeight && currentHeight > 0) {
          lastHeight = currentHeight;
          window.ReactNativeWebView.postMessage(String(currentHeight));
        }
      };

      const ro = new ResizeObserver(entries => {
        postHeight();
      });
      ro.observe(document.body);

      // Also post height on load and potentially other events
      window.addEventListener('load', postHeight);
      // Consider MutationObserver if ResizeObserver is not enough
      const observer = new MutationObserver(postHeight);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });

      // Initial post in case content is already rendered
      setTimeout(postHeight, 100); // Small delay might be needed
      postHeight(); // Post immediately too
    `
        : ''
    }

    true; // Required for Android
  `

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWebViewReady(true)
    }, 250)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      {!credentials ? (
        <LoadingScreen />
      ) : (
        <>
          {isWebViewReady ? (
            <WebView
              source={{
                uri: currentURI,
              }}
              onShouldStartLoadWithRequest={onWebViewRequest}
              setSupportMultipleWindows={false}
              nativeConfig={{
                props: {
                  webContentsDebuggingEnabled: true,
                },
              }}
              userAgent={'app'}
              allowsBackForwardNavigationGestures={false}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={Platform.OS === 'android'} // Only needed for Android
              incognito={false}
              cacheEnabled={true}
              pullToRefreshEnabled={true}
              startInLoadingState={true}
              renderLoading={() => {
                return loadingComponent || <LoadingScreen />
              }}
              ref={webViewRef}
              onLoadStart={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                // console.log('[WebView] onLoadStart:', nativeEvent.url)
              }}
              onLoad={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                // console.log('[WebView] onLoad:', nativeEvent.url)
              }}
              onLoadEnd={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                // console.log(
                //   '[WebView] onLoadEnd:',
                //   nativeEvent.loading ? 'Still loading' : 'Load finished',
                //   nativeEvent.url,
                // )
              }}
              onLoadProgress={({ nativeEvent }) => {
                // console.log('[WebView] onLoadProgress:', nativeEvent.progress)
              }}
              onError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                console.warn('[WebView] onError:', nativeEvent.code, nativeEvent.description, nativeEvent.url)
              }}
              style={[styles.baseWebViewStyle, style]}
              injectedJavaScript={combinedInjectedJavaScript}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              scrollEnabled={!disableScroll}
            />
          ) : (
            loadingComponent || <LoadingScreen />
          )}
        </>
      )}
    </SafeAreaView>
  )
}

// Add base styles for WebView
const styles = StyleSheet.create({
  baseWebViewStyle: {
    backgroundColor: theme.colors.background,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginBottom: 0,
    margin: 0,
    padding: 0,
    userSelect: 'none',
    opacity: 0.99, // Workaround for Android rendering issues sometimes
  },
})
