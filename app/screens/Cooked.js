import React, { useEffect, useLayoutEffect, useContext } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { observer } from 'mobx-react-lite'

import { getSavedRecipeUrl } from '../urls'

import { AuthContext } from '../context/auth'

import CookedWebView from '../components/CookedWebView'
import { useStore } from '../context/store/StoreContext'
import { Button, SecondaryButton } from '../components/Button'
import Cooked from '../components/Cooked/Cooked'
import { theme } from '../style/style'

const FollowButton = observer(({ username }) => {
  const { credentials } = useContext(AuthContext)
  const { username: loggedInUsername } = credentials

  const { profileStore } = useStore()
  const { isLoadingFollowing } = profileStore
  const isFollowing = profileStore.isFollowing(username)

  if (isLoadingFollowing || loggedInUsername === username) {
    return null
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isFollowing ? (
        <SecondaryButton title='Following' onPress={() => profileStore.unfollow(username)} />
      ) : (
        <Button title='Follow' onPress={() => profileStore.follow(username)} />
      )}
    </View>
  )
})

export default observer(({ navigation, route }) => {
  const { profileStore } = useStore()
  const { cookId, cookUsername } = route.params

  useEffect(() => {
    profileStore.loadFollowing()
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <FollowButton username={cookUsername} />,
    })
  }, [navigation])

  const onRecipePress = () => {
    navigation.navigate('Recipe', { recipeId: post.recipeId })
  }

  const onUserPress = () => {
    console.log('onUserPress', post.username)
    navigation.navigate('PublicProfile', { username: post.username })
  }

  const post = {
    authorName: 'eduardo',
    canEdit: true,
    recipeId: 'fb67f0f4-bfb6-4972-bfc5-17a026a57ffc',
    recipe: {
      image: 'https://cooked.wiki/image/thumbnail/38594179-6b77-4fb6-848d-a700bd1a00fc',
      title: 'Croissants À Moda Do Porto',
    },
    authorAvatar: 'https://cooked.wiki/image/thumbnail/profile/eduardo/e4038d2e-53b8-4cbb-80ee-c71c1ba2f4b0',
    image: 'https://cooked.wiki/image/photo/cooked/eduardo/411346c5-11d7-476b-92d4-60afa8d257a5',
    description:
      'First time making pastries with natural leavening! Made stiff levain (50%) using sourdough starter and adapted this recipe for 30% inoculation, adjusted other ingredients for the extra flour in the levain (x1.15).No bulk ferment, just 8 hours proof at 23c.',
    isLiked: false,
  }

  return (
    <ScrollView style={styles.container}>
      <Cooked post={post} onRecipePress={onRecipePress} onUserPress={onUserPress} />

      <View style={styles.similarSection}>
        <Text style={styles.similarHeader}>Similar Cooked</Text>
        {/* TODO: Add similar cookeds content here */}
      </View>
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  similarSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
  },
  similarHeader: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    marginBottom: 15,
    marginTop: 15,
    color: theme.colors.black,
    textAlign: 'center',
  },
})
