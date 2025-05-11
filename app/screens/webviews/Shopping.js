import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import CookedWebView from '../../components/CookedWebView'
import { theme } from '../../style/style'
import { getShoppingListUrl } from '../../urls'
import handler from './router/handler'

const Shopping = observer(({ navigation, route, username }) => {
  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation })
    },
    [navigation],
  )

  return (
    <View style={styles.container}>
      <CookedWebView
        startUrl={getShoppingListUrl(username)}
        navigation={navigation}
        route={route}
        onRequestPath={routeHandler}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
})

export default Shopping
