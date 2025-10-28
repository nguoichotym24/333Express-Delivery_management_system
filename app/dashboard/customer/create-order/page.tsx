"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientPhone: "",
    pickupAddress: "",
    deliveryAddress: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.recipientName.trim()) {
      setError("Vui lòng nhập tên người nhận")
      return
    }
    if (!formData.recipientPhone.trim()) {
      setError("Vui lòng nhập số điện thoại người nhận")
      return
    }
    if (!formData.pickupAddress.trim()) {
      setError("Vui lòng nhập địa chỉ lấy hàng")
      return
    }
    if (!formData.deliveryAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng")
      return
    }

    setLoading(true)
    try {
      // Simulate creating order
      const orderId = `DH${Date.now()}`

      // Store order in localStorage (in real app, this would be an API call)
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")
      orders.push({
        id: orderId,
        ...formData,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("orders", JSON.stringify(orders))

      // Redirect to order tracking
      router.push(`/tracking/${orderId}`)
    } catch (err) {
      setError("Tạo đơn hàng thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-2 text-primary hover:text-[#00A8CC] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold mb-2">Tạo đơn hàng mới</h1>
          <p className="text-secondary">Nhập thông tin đơn hàng để gửi đi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-default rounded-xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Recipient Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin người nhận</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên người nhận</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Tên người nhận hàng"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Số điện thoại người nhận</label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="border-t border-default pt-6">
              <h2 className="text-lg font-semibold mb-4">Địa chỉ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Địa chỉ lấy hàng</label>
                  <textarea
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ lấy hàng (Số nhà, đường, phường, quận, thành phố)"
                    rows={3}
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng</label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ giao hàng (Số nhà, đường, phường, quận, thành phố)"
                    rows={3}
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-default pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background hover:bg-[#00A8CC] transition-colors py-3 font-medium"
              >
                {loading ? "Đang tạo đơn hàng..." : "Tạo đơn hàng"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
