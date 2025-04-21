import { useApi } from '../../context/ApiContext'
import { useEffect, useState, useCallback } from 'react'

export default function useNotifications() {
  const api = useApi()

  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingNextPage, setLoadingNextPage] = useState(false)

  const loadNextPage = useCallback(async () => {
    if (loadingNextPage || loadingNotifications) throw new Error('Already loading')

    try {
      setLoadingNextPage(true)

      const data = await api.get(`/notifications?page=${currentPage + 1}`)
      setNotifications(prevNotifications => [...prevNotifications, ...data])
      setCurrentPage(prevPage => prevPage + 1)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoadingNextPage(false)
    }
  }, [api, currentPage, loadingNextPage, loadingNotifications])

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingNotifications(true)
        const data = await api.get('/notifications')
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoadingNotifications(false)
      }
    })()
  }, [api])

  return { notifications, loadingNotifications, loadNextPage, loadingNextPage }
}
