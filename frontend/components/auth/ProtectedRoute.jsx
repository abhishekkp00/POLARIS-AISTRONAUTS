import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Checking authentication…</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
