import { Linking } from 'react-native'

export default routes = [
  {
    path: '/saved/:id',
    handler: ({ navigation, params, queryParams }) => {
      navigation.navigate('Recipe', { recipeId: params.id, queryParams })
    },
  },
  {
    path: '/new/recent/:id',
    handler: ({ navigation, params }) => {
      navigation.navigate('Recipe', { extractId: params.id })
    },
  },
  {
    path: '/user/:username',
    handler: ({ navigation, params, loggedInUsername }) => {
      if (params.username === loggedInUsername) {
        navigation.navigate('Main', {
          screen: 'LoggedInProfile',
        })
      } else {
        navigation.push('PublicProfile', { username: params.username })
      }
    },
  },
  {
    path: '/user/:username/collections',
    handler: ({ navigation, params, loggedInUsername }) => {
      if (params.username === loggedInUsername) {
        navigation.navigate('Main', {
          screen: 'LoggedInProfile',
          params: {
            screen: 'Recipes',
            showCollections: true,
          },
        })
      } else {
        // For now let's not navigate to nested screen
        navigation.push('PublicProfile', { username: params.username })
      }
    },
  },
  {
    path: '/user/:username/collections/:id',
    handler: ({ navigation, params, loggedInUsername }) => {
      if (params.username === loggedInUsername) {
        navigation.navigate('Main', {
          screen: 'LoggedInProfile',
          params: {
            screen: 'Recipes',
            collectionId: params.id,
          },
        })
      } else {
        // For now let's not navigate to nested screen
        navigation.push('PublicProfile', { username: params.username })
      }
    },
  },
  {
    path: '/contact',
    handler: () => {
      Linking.openURL('https://cooked.wiki/contact')
    },
  },
  {
    path: '/buy',
    handler: ({ navigation }) => {
      navigation.navigate('Main', {
        screen: 'LoggedInProfile',
        params: {
          screen: 'Shopping',
        },
      })
    },
  },
]
