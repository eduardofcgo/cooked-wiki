import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import MainMenu from '../components/navigation/MainMenu'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'

function Main() {
  const { profileStore } = useStore()
  const { credentials } = useAuth()

  // Preload user profile
  useEffect(() => {
    try {
      if (credentials?.username) {
        profileStore.preloadProfile(credentials.username)
      }
    } catch (error) {
      console.error('Error preloading profile', error)
    }
  }, [credentials?.username, profileStore])

  return <MainMenu />
}

export default observer(Main)
