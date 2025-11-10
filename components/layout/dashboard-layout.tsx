"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      try { router.replace("/login") } catch {}
      // Safety fallback if the client router is stuck
      const id = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
          window.location.assign('/login')
        }
      }, 500)
      return () => clearTimeout(id)
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Show a small redirecting spinner instead of a blank screen
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Đang chuyển hướng…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
