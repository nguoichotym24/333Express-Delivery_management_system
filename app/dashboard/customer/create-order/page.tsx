"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Sender
    senderName: "",
    senderPhone: "",
    // Receiver
    recipientName: "",
    recipientPhone: "",
    // Addresses
    pickupAddress: "",
    deliveryAddress: "",
    // Weight (kg)
    weightKg: "1",
  })
  const [fee, setFee] = useState<number | null>(null)
  const [useMap, setUseMap] = useState(false)
  const [picked, setPicked] = useState<{ sender?: { lat: number; lng: number }; receiver?: { lat: number; lng: number } }>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function inferLatLng(address: string): { lat: number; lng: number } {
    const a = address.toLowerCase()
    if (a.includes("hà nội") || a.includes("ha noi")) return { lat: 21.0285, lng: 105.8542 }
    if (a.includes("hcm") || a.includes("tp.hcm") || a.includes("tp. hcm") || a.includes("hồ chí minh") || a.includes("ho chi minh"))
      return { lat: 10.7769, lng: 106.7009 }
    if (a.includes("đà nẵng") || a.includes("da nang")) return { lat: 16.0544, lng: 108.2022 }
    if (a.includes("cần thơ") || a.includes("can tho")) return { lat: 10.0452, lng: 105.7469 }
    if (a.includes("bình dương") || a.includes("binh duong")) return { lat: 10.9804, lng: 106.6519 }
    return { lat: 10.7769, lng: 106.7009 } // default HCMC
  }

  const LocationPicker = useMap
    ? dynamic(() => import("@/components/map/location-picker-client"), { ssr: false })
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.senderName.trim()) {
      setError("Vui lòng nhập tên người gửi")
      return
    }
    if (!formData.senderPhone.trim()) {
      setError("Vui lòng nhập số điện thoại người gửi")
      return
    }
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
    const weight = parseFloat(formData.weightKg)
    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Khối lượng không hợp lệ")
      return
    }

    setLoading(true)
    try {
      const from = picked.sender ?? inferLatLng(formData.pickupAddress)
      const to = picked.receiver ?? inferLatLng(formData.deliveryAddress)

      // Update fee if not yet calculated
      let feePreview = fee
      if (feePreview === null) {
        const resFee = await fetch(`/api/fees/calculate?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&weightKg=${weight}`)
        const dataFee = await resFee.json()
        if (resFee.ok) feePreview = dataFee.fee
      }

      const payload = {
        sender: {
          name: formData.senderName,
          phone: formData.senderPhone,
          address: formData.pickupAddress,
          lat: from.lat,
          lng: from.lng,
        },
        receiver: {
          name: formData.recipientName,
          phone: formData.recipientPhone,
          address: formData.deliveryAddress,
          lat: to.lat,
          lng: to.lng,
        },
        weightKg: weight,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Tạo đơn hàng thất bại')
      }

      router.push(`/tracking/${data.tracking_code}`)
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
            {/* Sender Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin người gửi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên người gửi</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    placeholder="Tên người gửi"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số điện thoại người gửi</label>
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

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

              <div className="mt-4">
                <Button type="button" variant="outline" onClick={() => setUseMap((v) => !v)}>
                  {useMap ? "Ẩn bản đồ" : "Chọn trên bản đồ"}
                </Button>
                {useMap && LocationPicker && (
                  <div className="mt-4">
                    <LocationPicker
                      sender={picked.sender ?? inferLatLng(formData.pickupAddress)}
                      receiver={picked.receiver ?? inferLatLng(formData.deliveryAddress)}
                      onChange={(next) => setPicked(next)}
                      height={300}
                    />
                    <p className="text-xs text-secondary mt-2">Kéo 2 marker để chọn vị trí lấy và giao hàng.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weight + Fee */}
            <div className="border-t border-default pt-6">
              <h2 className="text-lg font-semibold mb-4">Khối lượng & cước phí</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Khối lượng (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <div className="text-sm text-secondary">Cước dự kiến</div>
                  <div className="text-xl font-semibold">{fee !== null ? fee.toLocaleString("vi-VN") + " đ" : "—"}</div>
                </div>
                <div className="sm:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setError("")
                      const from = picked.sender ?? inferLatLng(formData.pickupAddress)
                      const to = picked.receiver ?? inferLatLng(formData.deliveryAddress)
                      const weight = parseFloat(formData.weightKg || '0')
                      if (!formData.pickupAddress || !formData.deliveryAddress || !Number.isFinite(weight) || weight <= 0) {
                        setError("Vui lòng nhập đủ địa chỉ và khối lượng hợp lệ để tính phí")
                        return
                      }
                      const res = await fetch(`/api/fees/calculate?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&weightKg=${weight}`)
                      const data = await res.json()
                      if (res.ok) setFee(data.fee)
                      else setError(data?.error || "Không tính được phí")
                    }}
                  >
                    Tính phí
                  </Button>
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
