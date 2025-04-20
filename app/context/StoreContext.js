import { createContext, useContext, useMemo } from 'react'

import RootStore from '../store/RootStore'
import { useApi } from './ApiContext'

const StoreContext = createContext()

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }

  return context
}

export function StoreProvider({ children }) {
  const apiClient = useApi()
  const rootStore = useMemo(() => new RootStore(apiClient), [apiClient])

  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
}
