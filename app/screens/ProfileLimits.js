import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import CookedWebView from '../components/CookedWebView'
import { getLimitsUrl } from '../urls'
import handler from './webviews/router/handler'

export default function ProfileLimits({ navigation, route }) {
  const queryParams = route.params?.queryParams || {}

  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation })
    },
    [navigation],
  )

  const startUrl = getLimitsUrl(queryParams)

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
