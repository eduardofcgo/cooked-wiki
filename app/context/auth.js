import React, { createContext, useContext } from 'react'

export const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}
