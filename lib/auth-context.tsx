"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "customer" | "warehouse" | "shipper" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
  warehouse_id?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Optimistically hydrate from localStorage to reduce flicker
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch {}

    // Authoritative fetch from server via cookie token
    ;(async () => {
      try {
        const res = await fetch('/api/users/me', { method: 'GET' })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        } else {
          setUser(null)
          localStorage.removeItem('user')
        }
      } catch {
        setUser(null)
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const userData = await response.json()
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      router.push(`/dashboard/${userData.role}`)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    try {
      // Fire-and-forget server-side cookie clear
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    } catch {}
    // Clear client state immediately
    setUser(null)
    try { localStorage.removeItem('user') } catch {}
    // Prefer replace to avoid going back into a protected page
    try { router.replace('/login') } catch {}
    // Ensure any stale caches are dropped
    try { router.refresh() } catch {}
    // Hard fallback in case navigation is stuck
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.assign('/login')
        }
      }, 300)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.address !== undefined) payload.address = data.address
    if (data.password) payload.password = (data as any).password
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated?.error || 'Update failed')
      const updatedUser = { ...user, ...updated }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (e) {
      throw e
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (undefined === context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
