import { createContext, useContext } from 'react'

export const StoreContext = createContext(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (context === null) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
