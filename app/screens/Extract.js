import CookedWebView from '../components/CookedWebView'
import { useShareIntentContext } from 'expo-share-intent'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export default function Extract({ navigation, route }) {
  const { hasShareIntent, shareIntent } = useShareIntentContext()
  const extractUrl =
    hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  const onRequest = request => {
    const url = request.url

    if (url.match(/\/user\/.*/) || url.endsWith('/recipes')) {
      navigation.navigate('ProfileView', { refresh: true })

      return false
    }

    if (url.endsWith('/shopping-list') || url.endsWith('/buy')) {
      navigation.navigate('ShoppingList', { refresh: true })
      
      return false
    }

    return true
  }

  return (
    extractUrl && (
      <CookedWebView
        startUrl={`https://cooked.wiki/${extractUrl}`}
        onRequest={onRequest}
        navigation={navigation}
        route={route}
      />
    )
  )
}
