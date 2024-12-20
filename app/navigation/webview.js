const defaultNavigate = true

export function defaultOnRequest(navigation, request) {
  const url = request.url

  if (url.endsWith('/contact')) {
    navigation.navigate('Contact')

    return !defaultNavigate
  }

  if (/\/saved\/[a-zA-Z0-9]+/.test(url)) {
    // navigation.push('Recipe', { recipeUrl: url })
    navigation.push('Cooked', { recipeUrl: url })

    return !defaultNavigate
  }

  if (url.endsWith('/login') || url.endsWith('cooked.wiki/')) {
    return !defaultNavigate
  }

  if (url.endsWith('/shopping-list') || url.endsWith('/buy')) {
    navigation.push('Main', {
      screen: 'LoggedInProfile',
      params: { screen: 'Shopping' },
    })

    return !defaultNavigate
  }

  if (/\/user\/([a-zA-Z0-9]+)/.test(url)) {
    const username = url.match(/\/user\/([a-zA-Z0-9]+)/)[1]
    navigation.push('PublicProfile', { username })

    return !defaultNavigate
  }

  return defaultNavigate
}
