import { useShareIntentContext } from 'expo-share-intent'
import { useEffect, useState } from 'react'
import NewExtract from './NewExtract'

export default function ShareIntentNewExtract() {
  const { hasShareIntent, shareIntent, resetShareIntent, error: shareError } = useShareIntentContext()

  const [url, setUrl] = useState(null)

  const sharedUrl = hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  console.log('hasShareIntent', shareIntent, url)

  useEffect(() => {
    if (sharedUrl) {
      console.log('sharedUrl', sharedUrl)
      setUrl(sharedUrl)

      // Reset the share intent after processing
      resetShareIntent()
    }
  }, [sharedUrl, resetShareIntent])

  if (!url) {
    return null
  }

  return <NewExtract url={url} />
}
