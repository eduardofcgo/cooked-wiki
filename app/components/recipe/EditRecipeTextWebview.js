import React, { useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import CookedWebView from '../CookedWebView'
import { getEditRecipeUrl } from '../../urls'

const EditRecipeTextWebview = forwardRef(
  ({ recipeId, navigation, route, onReceiveEditedRecipeHTML, onReceiveEditorUpdate }, ref) => {
    const webViewRef = useRef()

    const routeHandler = useCallback(() => {}, [])

    const onWebViewReady = useCallback(() => {
      console.log('WebView is ready, setting up editor')
      const script = `
                (function() {
                    function setupEditorListener() {
                        if (window.editor && window.editor.on) {
                            window.editor.on('update', ({ editor }) => {
                                const canUndo = editor.can().undo()
                                const canRedo = editor.can().redo()

                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'editorUpdate',
                                    controls: {
                                        canUndo: canUndo,
                                        canRedo: canRedo
                                    }
                                }))
                            })
                        } else {
                            console.error('Editor not ready yet');
                        }
                    }
                    
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', setupEditorListener);
                    } else {
                        setupEditorListener();
                    }
                })();
            `
      setTimeout(() => {
        webViewRef.current.injectJavaScript(script)
      }, 1)
    }, [])

    const undo = useCallback(() => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript('window.editor.commands.undo()')
      }
    }, [])

    const redo = useCallback(() => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript('window.editor.commands.redo()')
      }
    }, [])

    const blurEditor = useCallback(() => {
      if (webViewRef.current) {
        const script = `
                    (function() {
                        function blurEditor() {
                            if (window.editor && window.editor.commands) {
                                window.editor.commands.blur();
                            } else {
                                console.error('Editor not ready yet');
                            }
                        }
                        
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', blurEditor);
                        } else {
                            blurEditor();
                        }
                    })();
                    true;
                `
        webViewRef.current.injectJavaScript(script)
      }
    }, [])

    const setEditedRecipeHTML = useCallback(html => {
      if (webViewRef.current) {
        const script = `
                    (function() {
                        function setContent() {
                            if (window.editor && window.editor.commands) {
                                window.editor.commands.setContent(\`${html}\`);
                            } else {
                                console.error('Editor not ready yet');
                            }
                        }
                        
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', setContent);
                        } else {
                            setContent();
                        }
                    })();
                    true;
                `
        webViewRef.current.injectJavaScript(script)
      }
    }, [])

    const getEditedRecipeHTML = useCallback(messageId => {
      if (webViewRef.current) {
        const script = `
                    (function() {
                        try {
                            if (window.editor && typeof window.editor.getHTML === 'function') {
                                const html = window.editor.getHTML();
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    id: '${messageId}',
                                    type: 'editedRecipeHTML',
                                    html: html
                                }));
                            } else {
                                console.error('window.editor.getHTML is not available')
                            }
                        } catch (error) {
                            console.error(error)
                        }
                    })();
                    true;
                `
        webViewRef.current.injectJavaScript(script)
      }
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        blurEditor,
        getEditedRecipeHTML,
        setEditedRecipeHTML,
        undo,
        redo,
      }),
      [blurEditor, getEditedRecipeHTML, setEditedRecipeHTML, undo, redo],
    )

    const handleEditorMessage = useCallback(
      message => {
        try {
          if (message.type === 'editedRecipeHTML') {
            if (onReceiveEditedRecipeHTML) {
              onReceiveEditedRecipeHTML(message)
            }
          } else if (message.type === 'editorUpdate') {
            if (onReceiveEditorUpdate) {
              onReceiveEditorUpdate(message)
            }
          }
        } catch (error) {
          console.error(error)
        }
      },
      [onReceiveEditedRecipeHTML, onReceiveEditorUpdate],
    )

    const editUrl = getEditRecipeUrl(recipeId)

    return (
      <CookedWebView
        ref={webViewRef}
        key={editUrl}
        startUrl={editUrl}
        navigation={navigation}
        route={route}
        onRequestPath={routeHandler}
        onWebViewMessage={handleEditorMessage}
        onWebViewReady={onWebViewReady}
        disableRefresh={false}
        style={styles.webView}
        contentInset={{ top: 139 }}
      />
    )
  },
)

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
})

export default observer(EditRecipeTextWebview)
