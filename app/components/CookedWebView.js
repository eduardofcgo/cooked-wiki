import { Dimensions, Platform, SafeAreaView, Text, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../screens/Loading'
import { theme } from '../style/style'

const CookedWebView = forwardRef(
  (
    {
      startUrl,
      navigation,
      route,
      onRequestPath,
      disableRefresh,
      loadingComponent,
      dynamicHeight,
      onHeightChange,
      onWebViewReady,
      style,
    },
    ref,
  ) => {
    const windowHeight = Dimensions.get('window').height

    const webViewRef = useRef()
    const [isWebViewReady, setIsWebViewReady] = useState(false)

    const auth = useAuth()
    const { credentials } = auth
    const { token } = credentials

    const [currentURI, setURI] = useState(startUrl + `?token=${token}`)

    const [isRefreshing, setRefreshing] = useState(false)

    const refreshWebView = () => {
      if (!disableRefresh) {
        setRefreshing(true)

        webViewRef.current.injectJavaScript(`window.location.href = "${startUrl}";`)
        webViewRef.current.clearHistory()

        // For now, we are not waiting for the load event.
        setTimeout(() => {
          setRefreshing(false)
        }, 1000)
      }
    }

    useEffect(() => {
      if (isWebViewReady && onWebViewReady) {
        onWebViewReady()
      }
    }, [isWebViewReady])

    useEffect(() => {
      const refresh = route.params && route.params.refresh

      if (refresh) {
        refreshWebView()
      }
    }, [route.params])

    const onWebViewRequest = request => {
      const { url, navigationType } = request

      const initialUri = startUrl + `?token=${token}`

      // First page load does not need to check for routing
      if (url === initialUri || url === startUrl) {
        return true
      }

      if (onRequestPath) {
        const pathname = new URL(url).pathname
        const searchParams = new URL(url).searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        const handlePath = onRequestPath(pathname, queryParams)

        if (handlePath) {
          setTimeout(() => {
            handlePath()
          }, 1)

          // Found a handler, navigating to native screen, block webview navigation
          return false
        } else {
          // No handler found, allow the navigation inside webview
          return true
        }
      }

      return true
    }

    const handleMessage = event => {
      if (!isWebViewReady) {
        setIsWebViewReady(true)
      }

      const data = event.nativeEvent.data

      // Check for height message first (simple number string)
      const height = parseInt(data)
      if (!isNaN(height) && dynamicHeight && onHeightChange) {
        if (height > 0) {
          onHeightChange(height)
        }
        return
      }

      // Try parsing as JSON for other messages
      try {
        const message = JSON.parse(data)

        // Handle structured console messages from WebView
        if (message.type === 'console') {
          const { level, payload } = message
          const prefix = '[WebView Console]'
          switch (level) {
            case 'warn':
              console.warn(prefix, ...payload)
              break
            case 'error':
              console.error(prefix, ...payload)
              break
            case 'info':
              console.info(prefix, ...payload)
              break
            case 'debug':
              console.debug(prefix, ...payload)
              break
            default:
              console.log(prefix, ...payload)
              break
          }
          return // Handled this message
        }

        // Handle other structured messages
        if (message.type === 'logged-user') {
          // Webview is communicating a logout (usually initiated by server)
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
        console.log('[WebView Message]', data)
      }
    }

    const pullToRefreshJS = `
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
        // Only track start if at the top and not already pulling
        if (window.scrollY === 0) {
            const wrapper = getContentWrapper();
            // Ensure transition is off only during the drag
            wrapper.style.transition = 'none'; 
            touchStartY = e.touches[0].clientY;
        } else {
            touchStartY = 0; // Reset if not at top
        }
      }, { passive: true }); // Use passive: true where possible

      document.addEventListener('touchmove', function(e) {
        // Only process move if started at the top
        if (touchStartY > 0 && window.scrollY === 0) {
          touchEndY = e.touches[0].clientY;
          const pullDistance = touchEndY - touchStartY;
          
          if (pullDistance > 0) {
            // Prevent native scroll ONLY when actively pulling down
            e.preventDefault(); 
            const wrapper = getContentWrapper();
            // Apply transform with damping effect
            const damping = 0.4;
            const movement = Math.min(pullDistance * damping, MAX_PULL);
            wrapper.style.transform = \`translateY(\${movement}px)\`;
          }
        }
      }, { passive: false }); // Need false here to preventDefault

      document.addEventListener('touchend', function() {
         // Only process touchend if we were potentially pulling
         if (touchStartY > 0) {
             const pullDistance = touchEndY - touchStartY;
             const wrapper = getContentWrapper();
             
             // Smoothly animate back to original position regardless
             wrapper.style.transition = 'transform 0.2s';
             wrapper.style.transform = 'translateY(0)';
             
             // Trigger refresh only if threshold is met AND we were at scrollY 0
             // (window.scrollY === 0 check might be redundant if touchstart handled it, but safer)
             if (window.scrollY === 0 && pullDistance > THRESHOLD) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                     type: 'refresh',
                     pullDistance: pullDistance
                 }));
             }
         }
         // Reset values after touchend
         touchStartY = 0;
         touchEndY = 0;
      }, { passive: true }); // Can be passive
    `

    const loggingJS = `
      (function() { // Wrap in a function to avoid polluting global scope
        const originalConsole = window.console;
        window.console = {
          ...originalConsole, // Keep original methods if needed
          log: function() {
            const args = Array.from(arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: 'log', payload: args }));
            // originalConsole.log.apply(originalConsole, arguments); // Optionally log in webview console too
          },
          debug: function() {
            const args = Array.from(arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: 'debug', payload: args }));
            // originalConsole.debug.apply(originalConsole, arguments);
          },
          info: function() {
            const args = Array.from(arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: 'info', payload: args }));
            // originalConsole.info.apply(originalConsole, arguments);
          },
          warn: function() {
            const args = Array.from(arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: 'warn', payload: args }));
            // originalConsole.warn.apply(originalConsole, arguments);
          },
          error: function() {
            const args = Array.from(arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: 'error', payload: args }));
            // originalConsole.error.apply(originalConsole, arguments);
          }
        };
      })(); // Immediately invoke the function

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

    const injectedJS = `
      ${loggingJS}

      // Add a scroll event listener for testing
      window.addEventListener('scroll', function() {
        //window.ReactNativeWebView.postMessage("Scroll event detected inside WebView!");
      });

      window.externalScrollY = 0;

      ${dynamicHeight
        ? `
        window.externalViewportHeight = ${windowHeight};
        
        window.setExternalScrollY = function(scrollY) {
          window.externalScrollY = scrollY;

          const modals = document.querySelectorAll('.modal > .modal-content');
          modals.forEach(modal => {
              const modalHeight = modal.offsetHeight;
              const centerPosition = Math.max(0, (window.externalViewportHeight - modalHeight) / 2);
              const top = window.externalScrollY + centerPosition
              // const adjustedPosition = Math.min(window.externalViewportHeight, top);
              modal.style.top = top + 'px';
          })

          const scrollEvent = new Event('scroll', { bubbles: true });
          
          document.dispatchEvent(scrollEvent);
        };`
        : `
        
          window.setExternalScrollY = function(scrollY) {
          }
        `
      }

      ${dynamicHeight
        ? `
        let lastHeight = 0;
        const postHeight = () => {
          const currentHeight = document.body.scrollHeight;
          if (currentHeight !== lastHeight && currentHeight > 0) {
            lastHeight = currentHeight;
            window.ReactNativeWebView.postMessage(String(currentHeight));
          }
          
          const modals = document.querySelectorAll('.modal > .modal-content');
          modals.forEach(modal => {
              const modalHeight = modal.offsetHeight;
              const centerPosition = Math.max(0, (window.externalViewportHeight - modalHeight) / 2);
              const top = window.externalScrollY + centerPosition
              // const adjustedPosition = Math.min(window.externalViewportHeight, top);
              modal.style.top = top + 'px';
          })
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
        : `

        // Adjust modal position for the extra viewport height
        const modals = document.querySelectorAll('.modal > .modal-content');
        modals.forEach(modal => {
          modal.style.transform = 'translate(-50%, -80%)';
        })
        
        document.addEventListener('htmx:afterSettle', (event) => {
          const modals = document.querySelectorAll('.modal > .modal-content');
          modals.forEach(modal => {
            modal.style.transform = 'translate(-50%, -80%)';
          });
        });
        `
      }

      true; // Required for Android
    `

    useEffect(() => {
      const unsubscribe = navigation.addListener('blur', () => {
        webViewRef.current.injectJavaScript('window.closeModals && window.closeModals()')
      })

      return unsubscribe
    })

    useEffect(() => {
      if (webViewRef.current && dynamicHeight) {
        const windowHeight = Dimensions.get('window').height
        const script = `window.externalViewportHeight = ${windowHeight}; console.log('Injected viewportHeight:', window.externalViewportHeight); true;`
        webViewRef.current.injectJavaScript(script)
      }
    }, [webViewRef.current])

    useImperativeHandle(ref, () => ({
      injectScrollPosition: scrollY => {
        if (webViewRef.current) {
          const windowHeight = Dimensions.get('window').height

          const setExternalScrollJS = `
            window.externalViewportHeight = ${windowHeight};
            
            if (typeof window.setExternalScrollY === 'function') {
              window.setExternalScrollY(${scrollY});

            } else {
              console.warn('window.setExternalScrollY is not defined in WebView');
            }
            true; // Return true for Android
          `
          webViewRef.current.injectJavaScript(setExternalScrollJS)
        }
      },
    }))

    return !credentials ? (
      <LoadingScreen />
    ) : (
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
        cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
        androidLayerType={'hardware'}
        pullToRefreshEnabled={!dynamicHeight}
        startInLoadingState={false}
        allowsLinkPreview={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        saveFormDataDisabled={true}
        onContentProcessDidTerminate={() => {
          webViewRef.current.reload()
        }}
        renderLoading={() => {
          return null
          // return loadingComponent || <LoadingScreen />
        }}
        ref={webViewRef}
        onOpenWindow={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          console.log('onOpenWindow', nativeEvent)
        }}
        onFileDownload={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          console.log('onFileDownload', nativeEvent)
        }}
        onLoadStart={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
        }}
        onLoad={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
        }}
        onLoadEnd={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
        }}
        onLoadProgress={({ nativeEvent }) => { }}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          console.warn('[WebView] onError:', nativeEvent.code, nativeEvent.description, nativeEvent.url)
        }}
        style={[styles.baseWebViewStyle, style]}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        scrollEnabled={!dynamicHeight}
        bounces={false}
        contentInset={!dynamicHeight ? { bottom: 400 } : undefined}
      />
    )
  },
)

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

export default CookedWebView
