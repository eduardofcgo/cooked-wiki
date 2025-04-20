import { createContext, useContext, useMemo } from 'react'

const ApiContext = createContext()

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within a ApiProvider')
  }

  return context
}

export function ApiProvider({ client, children }) {
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
}
