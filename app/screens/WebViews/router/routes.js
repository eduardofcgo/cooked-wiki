export default routes = [
  {
    path: '/saved/:id',
    handler: ({ navigation, params }) => {
      navigation.push('Recipe', { recipeId: params.id })
    },
  },
  {
    path: '/new/recent/:id',
    handler: ({ navigation, params }) => {
      navigation.push('Recipe', { extractId: params.id })
    },
  },
  {
    path: '/user/:username',
    handler: ({ navigation, params }) => {
      navigation.push('PublicProfile', { username: params.username })
    },
  },
  {
    path: '/buy',
    handler: ({ navigation }) => {
      navigation.push('Shopping')
    },
  },
]
