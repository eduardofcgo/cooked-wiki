import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'

import CookedWebView from '../../components/CookedWebView'
import { getShoppingListUrl } from '../../urls'
import handler from './router/handler'
import { theme } from '../../style/style'

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
