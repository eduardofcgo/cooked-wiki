import { useApi } from '../../context/ApiContext'
import React, { useEffect, useState } from 'react'

export default function useCookedLikes({ cookedId }) {
  const api = useApi()

  const [likes, setLikes] = useState([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  
  useEffect(() => {
    (async () => {
      if (!cookedId) return
      
      try {
        setLoading(true)

        const data = await api.get(`/journal/${cookedId}/likes`)
        const likeUsernames = data.likes.map(like => like.username)
        
        setLikes(likeUsernames)
        setFailed(false)
     
      } catch (err) {
        console.error('Error fetching likes:', err)
        setFailed(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [api, cookedId])

  return { likes, loading, failed }
}
