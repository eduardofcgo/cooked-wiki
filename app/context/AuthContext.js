import React, { createContext, useContext, useEffect, useState } from 'react'

import { StoreProvider } from './StoreContext'

import { ApiClient } from '../api/client'
import AuthService from '../auth/service'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within a AuthProvider')
  }

  return context
}

export const AuthProvider = ({ children, onLoadedCredentials }) => {
  const [authContext, setAuthContext] = useState({
    credentials: undefined,
    loggedIn: false,

    login: async (username, password) => {
      const newCredentials = await AuthService.login(username, password)

      setAuthContext({ ...authContext, credentials: newCredentials, loggedIn: true })
    },

    logout: async () => {
      await AuthService.logout()

      setAuthContext({ ...authContext, credentials: null, loggedIn: false })
    },
  })

  useEffect(() => {
    const restoreCredentials = async () => {
      let storedCredentials = null
      try {
        storedCredentials = await AuthService.getStoredCredentials()
      } catch (error) {
        console.error('Error restoring credentials', error)
      }

      setAuthContext({
        ...authContext,
        credentials: storedCredentials,
        loggedIn: Boolean(storedCredentials),
      })
    }

    restoreCredentials()
  }, [])

  const loadedCredentials = Boolean(authContext.credentials)
  const apiClient = loadedCredentials ? new ApiClient(authContext.credentials) : null

  useEffect(() => {
    if (loadedCredentials) {
      onLoadedCredentials()
    }
  }, [loadedCredentials])

  return (
    <AuthContext.Provider value={authContext}>
      {loadedCredentials ? <StoreProvider apiClient={apiClient}>{children}</StoreProvider> : null}
    </AuthContext.Provider>
  )
}
