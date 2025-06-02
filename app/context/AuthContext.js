import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Sentry from '@sentry/react-native'

import { ApiProvider } from './ApiContext'
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

export const AuthProvider = ({ children, onLoadedCredentials, baseURL, apiBaseURL }) => {
  const [authContext, setAuthContext] = useState({
    credentials: undefined,
    loggedIn: false,

    loginPassword: async (username, password) => {
      const newCredentials = await AuthService.loginPassword(username, password)

      setAuthContext({ ...authContext, credentials: newCredentials, loggedIn: true })
    },

    googleLogin: async (username, idToken) => {
      const newCredentials = await AuthService.googleLogin(username, idToken)

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

  useEffect(() => {
    if (authContext.credentials && authContext.loggedIn) {
      Sentry.setUser({ username: authContext.credentials.username })
    } else {
      Sentry.setUser(null)
    }
  }, [authContext.credentials, authContext.loggedIn])

  const loadedCredentials = authContext.credentials !== undefined
  const apiClient = loadedCredentials ? new ApiClient(baseURL, apiBaseURL, authContext.credentials) : null

  useEffect(() => {
    if (apiClient) {
      // Server logs the user out (expired auth token for example)
      apiClient.onUnauthorized(() => {
        setAuthContext({ ...authContext, credentials: null, loggedIn: false })
      })
    }
  }, [apiClient])

  useEffect(() => {
    if (loadedCredentials) {
      onLoadedCredentials()
    }
  }, [loadedCredentials])

  return (
    <AuthContext.Provider value={authContext}>
      {loadedCredentials ? (
        <ApiProvider client={apiClient}>
          <StoreProvider>{children}</StoreProvider>
        </ApiProvider>
      ) : null}
    </AuthContext.Provider>
  )
}
