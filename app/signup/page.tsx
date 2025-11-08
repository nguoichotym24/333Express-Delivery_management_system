"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }
    setLoading(true)
    try {
      // Tạm thời mô phỏng đăng ký (giữ nguyên hành vi cũ)
      localStorage.setItem("user", JSON.stringify({ id: `user_${Date.now()}`, email: formData.email, name: formData.name, role: "customer", phone: formData.phone }))
      router.push("/dashboard/customer")
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-end p-4 md:p-8" style={{ backgroundImage: "url('/bg-loginsignup.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="mb-4">
          <Link href="/" className="text-primary hover:underline text-sm font-medium">← Quay lại trang chủ</Link>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Đăng ký</h1>
            <Link href="/help" className="text-primary hover:underline text-sm font-medium">Trợ giúp</Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 text-sm">{error}</div>}

          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên của bạn" className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none" required />
            </div>
          </div>

          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none" required />
            </div>
          </div>

          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Mật khẩu" className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>

          <div>
            <div className="flex items-center border-b-2 border-gray-300 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" className="flex-1 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:outline-none" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 py-3 font-medium rounded-lg transition-colors">{loading ? "Đang đăng ký..." : "Đăng ký"}</Button>
        </form>
      </div>
    </div>
  )
}

