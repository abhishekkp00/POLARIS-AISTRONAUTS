import React, { createContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '' // e.g. http://localhost:3001

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAuthenticated = !!user && !!token

  // Helper: wrap responses to common shape
  const handleResponse = async (res) => {
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json?.error || json?.message || 'Request failed')
    return json
  }

  const saveSession = (userObj, tokenStr) => {
    setUser(userObj)
    setToken(tokenStr)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', tokenStr)
        localStorage.setItem('authUser', JSON.stringify(userObj))
      }
    } catch {
      // ignore localStorage errors
    }
  }

  const clearSession = () => {
    setUser(null)
    setToken(null)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    } catch {
      // ignore localStorage errors
    }
  }

  const signup = async ({ email, password, name, role } = {}) => {
    setLoading(true)
    setError(null)
    try {
      if (!email || !password || !name) throw new Error('Missing fields')
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })
      const json = await handleResponse(res)
      const { user: u, token: t } = json.data || {}
      saveSession(u, t)
      setLoading(false)
      return { success: true, data: json.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }

  const login = async ({ email, password } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await handleResponse(res)
      const { user: u, token: t } = json.data || {}
      saveSession(u, t)
      setLoading(false)
      return { success: true, data: json.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }

  const logout = async (opts = { callServer: true }) => {
    setLoading(true)
    setError(null)
    try {
      // optional server-side logout
      if (opts.callServer && token) {
        try {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch {
          // ignore server logout errors
        }
      }
      clearSession()
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }

  // Validate token with backend and restore user
  const restoreFromStorage = async () => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined') return setLoading(false)
      const t = localStorage.getItem('authToken')
      if (!t) return setLoading(false)
      // call /api/auth/me
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) {
        clearSession()
        setLoading(false)
        return
      }
      const json = await res.json()
      const currentUser = json.data
      saveSession(currentUser, t)
    } catch (err) {
      clearSession()
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    restoreFromStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
