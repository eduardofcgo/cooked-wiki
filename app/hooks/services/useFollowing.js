import { useApi } from '../../context/ApiContext'
import { useEffect, useState } from 'react'

export default function useFollowing({ username }) {
    const api = useApi()

    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        ; (async () => {
            if (!username) return

            try {
                setLoading(true)

                const { users } = await api.get(`/user/${username}/following`)
                setFollowing(users)
                setFailed(false)

            } catch (err) {
                console.error('Error fetching following:', err)
                setFailed(true)

            } finally {
                setLoading(false)
            }
        })()
    }, [api, username])

    return { following, loading, failed }
} 