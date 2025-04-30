import { useApi } from '../../context/ApiContext'
import { useEffect, useState, useCallback } from 'react'

export default function useTryGetSimilarCooks({ recipeId }) {
  const api = useApi()

  const [similarCooks, setSimilarCooks] = useState([])
  const [loadingSimilarCooks, setLoadingSimilarCooks] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingNextPage, setLoadingNextPage] = useState(false)

  const loadNextPage = useCallback(async () => {
    if (loadingNextPage || loadingSimilarCooks) throw new Error('Already loading')

    try {
      setLoadingNextPage(true)

      const data = await api.get(`/community/similar/${recipeId}?page=${currentPage + 1}`)

      setSimilarCooks(prevCooks => [...prevCooks, ...(data || [])])
      setCurrentPage(prevPage => prevPage + 1)
    } catch (err) {
      console.error('Error fetching similar cooks:', err)
    } finally {
      setLoadingNextPage(false)
    }
  })

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingSimilarCooks(true)
        const data = await api.get(`/community/similar/${recipeId}`)
        setSimilarCooks(data)
      } catch (err) {
        console.error('Error fetching similar cooks:', err)
      } finally {
        setLoadingSimilarCooks(false)
      }
    })()
  }, [recipeId, api])

  return {
    similarCooks,
    loadingSimilarCooks,
    loadNextPage,
    loadingNextPage,

    // Infinite scroll
    hasMoreSimilarCooks: true,
  }
}
