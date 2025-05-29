import { createContext, useContext, useMemo } from 'react'
import { observer } from 'mobx-react-lite'

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

export const StoreProvider = observer(function StoreProvider({ children }) {
  const apiClient = useApi()
  const rootStore = useMemo(() => new RootStore(apiClient), [apiClient])

  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
})
