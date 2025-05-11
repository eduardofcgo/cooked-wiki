import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import CookedWebView from '../../components/CookedWebView'
import { useAuth } from '../../context/AuthContext'
import { theme } from '../../style/style'
import { getProfileUrl } from '../../urls'
import handler from './router/handler'

const Recipes = observer(({ navigation, route, username }) => {
  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation, loggedInUsername })
    },
    [navigation, loggedInUsername],
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
    paddingBottom: 250,
    backgroundColor: theme.colors.background,
  },
})

export default Recipes
