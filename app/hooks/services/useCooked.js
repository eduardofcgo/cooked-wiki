import React, { useEffect, useState } from 'react'

import { useApi } from '../../context/ApiContext'

export default function useCooked(cookedId) {
  const api = useApi()

  const [cooked, setCooked] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const cooked = await api.get(`/journal/${cookedId}`)
        setCooked(cooked)
      } catch (err) {
        console.error('Error fetching cooked:', err)
        setFailed(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [api, cookedId])

  return { cooked, loading, failed }
}
