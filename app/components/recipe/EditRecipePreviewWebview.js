import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import CookedWebView from '../CookedWebView'
import { getEditPreviewRecipeUrl } from '../../urls'

function EditRecipePreviewWebview({ recipeId, navigation, route, editedRecipeHtml }) {
  const routeHandler = useCallback(() => {}, [])

  return (
    <CookedWebView
      source={{
        uri: getEditPreviewRecipeUrl(recipeId),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'editor-recipe-html': editedRecipeHtml,
        }),
      }}
      navigation={navigation}
      route={route}
      onRequestPath={routeHandler}
      disableRefresh={true}
      style={styles.webView}
      contentInset={{ top: 139 }}
    />
  )
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
})

export default EditRecipePreviewWebview
