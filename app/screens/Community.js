import CookedWebView from '../components/CookedWebView'
import { useShareIntentContext } from 'expo-share-intent'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export default function Community({ navigation, route }) {
  // const { hasShareIntent, shareIntent } = useShareIntentContext()
  // const extractUrl = hasShareIntent && shareIntent.type === "weburl" && shareIntent.webUrl
  //
  const defaultUrl = 'https://cooked.wiki/community'
  // const [url, setUrl] = useState(defaultUrl)

  // useFocusEffect(
  //   useCallback(() => {
  //     if (extractUrl) {
  //       setUrl(`https://cooked.wiki/${extractUrl}`)
  //     }
  //   }, [extractUrl])
  // )

  // const onBeforeLoad = request => {
  //   const url = request.url
  //
  //
  //   if (url.endsWith('cooked.wiki/recipes')) {
  //     navigation.navigate('Profile', { reset: true })
  //     setUrl(defaultUrl)
  //
  //     console.log('URL', url)
  //
  //     return false
  //   } else {
  //     return true
  //   }
  // }

  return (
    <CookedWebView
      startUrl={defaultUrl}
      // startUrl={url}
      navigation={navigation}
      route={route}
      // onBeforeLoad={onBeforeLoad}
    />
  )
}
