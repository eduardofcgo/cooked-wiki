import React, { useEffect, useLayoutEffect, useContext } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { getCookedUrl } from '../urls'

import { AuthContext } from '../context/auth'

import CookedWebView from '../components/CookedWebView'
import { useStore } from '../context/store/StoreContext'
import { Button, SecondaryButton } from '../components/Button'
import Cooked from '../components/Cooked'

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
      }}>
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

  const post = {
    authorName: "eduardo",
    canEdit: false,
    recipe: {
      image: "https://cooked.wiki/image/thumbnail/38594179-6b77-4fb6-848d-a700bd1a00fc",
      title: "Croissants À Moda Do Porto",
    },
    authorAvatar: "https://cooked.wiki/image/thumbnail/profile/eduardo/e4038d2e-53b8-4cbb-80ee-c71c1ba2f4b0",
    image: "https://cooked.wiki/image/photo/cooked/eduardo/411346c5-11d7-476b-92d4-60afa8d257a5",
    description: "First time making pastries with natural leavening! Made stiff levain (50%) using sourdough starter and adapted this recipe for 30% inoculation, adjusted other ingredients for the extra flour in the levain (x1.15).No bulk ferment, just 8 hours proof at 23c.",
    isLiked: false,
  };

  return <Cooked post={post} />
})
