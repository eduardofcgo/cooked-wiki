import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import CookedWebView from '../../components/CookedWebView'
import { getPrintRecipeUrl, getPrintExtractUrl } from '../../urls'
import handler from '../webviews/router/handler'

export default function RecipePrint({ navigation, route }) {
  const { recipeId, extractId } = route.params

  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation })
    },
    [navigation],
  )

  const startUrl = recipeId ? getPrintRecipeUrl(recipeId) : extractId ? getPrintExtractUrl(extractId) : null

  if (!startUrl) {
    return null
  }

  return (
    <View style={styles.container}>
      <CookedWebView
        startUrl={startUrl}
        navigation={navigation}
        route={route}
        onRequestPath={routeHandler}
        disableRefresh={true}
        style={styles.webView}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
})
