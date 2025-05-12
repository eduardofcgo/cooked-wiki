import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import CookedWebView from '../../components/CookedWebView'
import { useAuth } from '../../context/AuthContext'
import { theme } from '../../style/style'
import { getProfileUrl, getCollectionUrl, getCollectionsUrl } from '../../urls'
import handler from './router/handler'
import Loading from '../../screens/Loading'

const Recipes = observer(({ navigation, route, username }) => {
  const { credentials } = useAuth()
  const loggedInUsername = credentials.username

  const collectionId = route.params?.collectionId
  const showCollections = route.params?.showCollections

  const startUrl = showCollections
    ? getCollectionsUrl(username)
    : collectionId
      ? getCollectionUrl(username, collectionId)
      : getProfileUrl(username)

  const routeHandler = useCallback(
    pathname => {
      return handler(pathname, { navigation, loggedInUsername })
    },
    [navigation, loggedInUsername],
  )

  return (
    <View style={styles.container}>
      <CookedWebView
        startUrl={startUrl}
        navigation={navigation}
        onRequestPath={routeHandler}
        loadingComponent={<Loading />}
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
