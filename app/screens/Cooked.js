import React, { useEffect, useLayoutEffect } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { getCookedUrl } from '../urls'

import { AuthContext } from '../context/auth'

import CookedWebView from '../components/CookedWebView'
import { useStore } from '../context/store/StoreContext'
import { Button, SecondaryButton } from '../components/Button'

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

const Cooked = observer(({ navigation, route }) => {
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

  return <CookedWebView 
    startUrl={getCookedUrl(cookId)} 
    navigation={navigation} 
    route={route} 
  />
})

export default Cooked 