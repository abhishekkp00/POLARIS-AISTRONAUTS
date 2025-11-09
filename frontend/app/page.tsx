'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import LaunchSequence from '@/components/LaunchSequence'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        router.push('/dashboard')
      } else {
        // Redirect unauthenticated users to login
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  // Show launch sequence while checking auth
  if (loading) {
    return <LaunchSequence onComplete={() => {}} darkMode={false} />
  }

  return null
}
