import { useShareIntentContext } from 'expo-share-intent'
import { useEffect, useState } from 'react'
import NewExtract from './NewExtract'
import GenericError from '../components/core/GenericError'
import { observer } from 'mobx-react-lite'
import Loading from './Loading'

function ShareIntentNewExtract() {
  const { hasShareIntent, shareIntent, resetShareIntent, error: shareError } = useShareIntentContext()

  const [url, setUrl] = useState(undefined)

  const sharedUrl = hasShareIntent && shareIntent.type === 'weburl' && shareIntent.webUrl

  useEffect(() => {
    if (hasShareIntent && sharedUrl) {
      console.log('Shared URL using share intent', sharedUrl)

      setUrl(sharedUrl)

      resetShareIntent()
    } else if (hasShareIntent) {
      console.log('No shared URL using share intent', shareIntent)

      setUrl(null)
    }
  }, [hasShareIntent, sharedUrl, resetShareIntent])

  if (url === undefined) {
    return <Loading />
  }

  if (shareError || url === null) {
    return <GenericError customMessage={'To create a recipe, please share a link to a recipe from the web.'} />
  }

  return <NewExtract url={url} />
}

export default observer(ShareIntentNewExtract)
