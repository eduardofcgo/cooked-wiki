export default routes = [
  {
    path: '/saved/:id',
    handler: ({ navigation, params }) => {
      navigation.navigate('Recipe', { recipeId: params.id })
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
    handler: ({ navigation, params }) => {
      navigation.navigate('PublicProfile', { username: params.username })
    },
  },
  {
    path: '/buy',
    handler: ({ navigation }) => {
      navigation.navigate('Shopping')
    },
  },
]
