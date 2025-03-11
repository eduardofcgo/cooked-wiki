import React, { useEffect, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'

import CookedWebView from '../../components/CookedWebView'
import { getProfileUrl } from '../../urls'
import { theme } from '../../style/style'
import handler from './router/handler'

const Recipes = observer(({ navigation, route, username }) => {
  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation })
    },
    [navigation],
  )

  return (
    <View style={styles.container}>
      <CookedWebView
        startUrl={getProfileUrl(username)}
        navigation={navigation}
        onRequestPath={routeHandler}
        route={route}
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

export default Recipes
