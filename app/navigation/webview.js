
export function defaultOnRequest(navigation, request) {
  const url = request.url
  const disableRequest = false

  console.log("navigating", url)

  if (url.endsWith('/contact')) {
    navigation.navigate('Contact')

    return disableRequest
  }

  if (/\/saved\/[a-zA-Z0-9]+/.test(url)) {
    navigation.navigate('Recipe', { recipeUrl: url })

    return disableRequest
  }

  if (url.endsWith('/login') || url.endsWith('cooked.wiki/')) {
    // TODO: should clean cookies from localstorage?
    navigation.navigate('Start')

    return disableRequest
  }

  // return undefined
  return true
}
