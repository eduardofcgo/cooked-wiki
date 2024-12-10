import { createContext, useContext } from 'react'
import { RootStore } from '../store/RootStore'

export const StoreContext = createContext(null)

export function useStores() {
  const context = useContext(StoreContext)
  if (context === null) {
    throw new Error('useStores must be used within a StoreProvider')
  }
  return context
}

// Convenience hooks for individual stores
export const useSocialStore = () => useStores().socialStore
export const useAuthStore = () => useStores().authStore 