import { Linking } from 'react-native'
import { getShoppingListPrintUrl, getPrintRecipeUrl, getPrintExtractUrl } from '../../../urls'

export default routes = [
  {
    path: '/saved/:id',
    handler: ({ navigation, params, queryParams }) => {
      navigation.navigate('Recipe', { recipeId: params.id, queryParams })
    },
  },
  {
    path: '/new/recent/:id',
    handler: ({ navigation, params, queryParams }) => {
      navigation.navigate('Recipe', { extractId: params.id, queryParams })
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
    path: '/user/:username/shopping-list/print',
    handler: ({ navigation, params }) => {
      navigation.push('PrintPDF', { pdfUrl: getShoppingListPrintUrl(params.username) })
    },
  },
  {
    path: '/saved/:id/print',
    handler: ({ navigation, params }) => {
      navigation.push('PrintPDF', { pdfUrl: getPrintRecipeUrl(params.id) })
    },
  },
  {
    path: '/new/recent/:id/print',
    handler: ({ navigation, params }) => {
      navigation.push('PrintPDF', { pdfUrl: getPrintExtractUrl(params.id) })
    },
  },
  {
    path: '/limits',
    handler: ({ navigation, queryParams }) => {
      navigation.push('ProfileLimits', { queryParams })
    },
  },
  {
    path: '/team',
    handler: () => {
      Linking.openURL('https://cooked.wiki/team')
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
