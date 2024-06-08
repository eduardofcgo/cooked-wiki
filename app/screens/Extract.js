import CookedWebView from '../components/CookedWebView'
import { useShareIntentContext } from 'expo-share-intent'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export default function Extract({ navigation, route }) {
  const { hasShareIntent, shareIntent } = useShareIntentContext()
  const extractUrl =
    hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  const onBeforeLoad = request => {
    const url = request.url

    if (url.endsWith('cooked.wiki/recipes')) {
      navigation.navigate('Profile', { reset: true })

      return false
    } else {
      return true
    }
  }

  return (
    extractUrl && (
      <CookedWebView
        startUrl={`https://cooked.wiki/${extractUrl}`}
        navigation={navigation}
        route={route}
        onBeforeLoad={onBeforeLoad}
      />
    )
  )
}
