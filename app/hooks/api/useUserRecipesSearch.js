import { useApi } from '../../context/ApiContext'
import { useEffect, useState, useRef } from 'react'

export default function useUserRecipesSearch({ query, debounceMs = 300 }) {
  const api = useApi()

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)

  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    if (query === null) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        setLoading(true)

        const data = await api.get(`/user/recipes/search?query=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current.signal,
        })

        setRecipes(data.items || [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching recipes:', err)
        }
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, api, debounceMs])

  return {
    recipes,
    loading,
  }
}
