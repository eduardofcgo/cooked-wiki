export function defaultOnRequest(navigation, request) {
  const disableRequest = false

  const url = request.url

  if (url.endsWith('cooked.wiki/contact')) {
    navigation.navigate('Contact')

    return disableRequest
  }

  if (url.endsWith('cooked.wiki/login') || url.endsWith('cooked.wiki/')) {
    navigation.navigate('Login')

    return disableRequest
  }

  if (url.startsWith('cooked.wiki/saved')) {
    navigation.navigate('Contact')

    return disableRequest
  }

  return undefined
}
