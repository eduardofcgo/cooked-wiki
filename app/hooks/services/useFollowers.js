import { useApi } from '../../context/ApiContext'
import { useEffect, useState } from 'react'

export default function useFollowers({ username }) {
    const api = useApi()

    const [followers, setFollowers] = useState([])
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        ; (async () => {
            if (!username) return

            try {
                setLoading(true)

                const { users } = await api.get(`/user/${username}/followers`)
                setFollowers(users)
                setFailed(false)

            } catch (err) {
                console.error('Error fetching followers:', err)
                setFailed(true)

            } finally {
                setLoading(false)
            }
        })()
    }, [api, username])

    return { followers, loading, failed }
} 