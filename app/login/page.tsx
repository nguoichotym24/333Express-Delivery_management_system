"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError("Email hoặc mật khẩu không chính xác")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
  }

  const demoAccounts = [
    { email: "customer@example.com", role: "Khách hàng" },
    { email: "warehouse@example.com", role: "Kho vận chuyển" },
    { email: "shipper@example.com", role: "Shipper" },
    { email: "admin@example.com", role: "Admin" },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-end p-4 md:p-8"
      style={{
        backgroundImage: "url('/bg-loginsignup.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="mb-4">
        <Link href="/" className="text-primary hover:underline text-sm font-medium"> ↩      Quay lại trang chủ</Link>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-3xl font-bold text-gray-900">Đăng nhập</p>
            <Link href="/help" className="text-primary hover:underline text-sm font-medium">
              Trợ giúp
            </Link>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 text-sm">{error}</div>
          )}

          {/* Email Input */}
          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="SDT / Tên người dùng / Email"
                className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <Link href="/forgot-password" className="text-primary hover:underline text-sm ml-2 whitespace-nowrap">
                Quên?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-primary/90 py-3 font-medium rounded-lg transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm"></span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-600 text-center mb-6">
          By continuing, you understand and accept{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Điều khoản dịch vụ
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>
          .
        </p>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Bạn chưa có tài khoản?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Đăng ký
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3 font-medium">Tài khoản demo (Mật khẩu: password123)</p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoAccount(account.email)}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                <div className="font-medium text-primary">{account.role}</div>
                <div className="text-gray-600 text-xs">{account.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
