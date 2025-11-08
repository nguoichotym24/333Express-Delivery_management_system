"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"

type Coordinates = { lat: number; lng: number }

const INITIAL_FORM = {
  senderName: "",
  senderPhone: "",
  recipientName: "",
  recipientPhone: "",
  pickupAddress: "",
  deliveryAddress: "",
  weightKg: "1",
}

export default function CreateOrderPage() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [fee, setFee] = useState<number | null>(null)
  const [useMap, setUseMap] = useState(false)
  const [picked, setPicked] = useState<{ sender?: Coordinates; receiver?: Coordinates }>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<null | { trackingCode: string; warehouse?: { name: string; code: string } }>(null)

  const LocationPicker = useMap ? dynamic(() => import("@/components/map/location-picker-client"), { ssr: false }) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  const inferLatLng = (address: string): Coordinates => {
    const text = normalize(address)
    if (text.includes("ha noi")) return { lat: 21.0285, lng: 105.8542 }
    if (text.includes("ho chi minh") || text.includes("hcm") || text.includes("sai gon"))
      return { lat: 10.7769, lng: 106.7009 }
    if (text.includes("da nang")) return { lat: 16.0544, lng: 108.2022 }
    if (text.includes("can tho")) return { lat: 10.0452, lng: 105.7469 }
    if (text.includes("binh duong")) return { lat: 10.9804, lng: 106.6519 }
    return { lat: 10.7769, lng: 106.7009 }
  }

  const validate = () => {
    if (!formData.senderName.trim()) {
      setError("Vui lòng nhập tên người gửi")
      return false
    }
    if (!formData.senderPhone.trim()) {
      setError("Vui lòng nhập số điện thoại người gửi")
      return false
    }
    if (!formData.recipientName.trim()) {
      setError("Vui lòng nhập tên người nhận")
      return false
    }
    if (!formData.recipientPhone.trim()) {
      setError("Vui lòng nhập số điện thoại người nhận")
      return false
    }
    if (!formData.pickupAddress.trim()) {
      setError("Vui lòng nhập địa chỉ lấy hàng")
      return false
    }
    if (!formData.deliveryAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng")
      return false
    }
    const weight = Number.parseFloat(formData.weightKg)
    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Khối lượng không hợp lệ")
      return false
    }
    return true
  }

  const handleFeePreview = async () => {
    setError("")
    const weight = Number.parseFloat(formData.weightKg || "0")
    if (!formData.pickupAddress.trim() || !formData.deliveryAddress.trim()) {
      setError("Vui lòng nhập đủ địa chỉ để ước tính cước")
      return
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Khối lượng không hợp lệ")
      return
    }
    const from = picked.sender ?? inferLatLng(formData.pickupAddress)
    const to = picked.receiver ?? inferLatLng(formData.deliveryAddress)
    try {
      const res = await fetch(
        `/api/fees/calculate?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&weightKg=${weight}`,
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Không tính được cước")
      }
      setFee(data.fee)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tính được cước")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return

    setLoading(true)
    try {
      const weight = Number.parseFloat(formData.weightKg)
      const from = picked.sender ?? inferLatLng(formData.pickupAddress)
      const to = picked.receiver ?? inferLatLng(formData.deliveryAddress)

      let feePreview = fee
      if (feePreview === null) {
        const resFee = await fetch(
          `/api/fees/calculate?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&weightKg=${weight}`,
        )
        const dataFee = await resFee.json()
        if (resFee.ok) {
          feePreview = dataFee.fee
          setFee(dataFee.fee)
        }
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

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Tạo đơn hàng thất bại")
      }

      const originWarehouseId =
        data.origin_warehouse_id ??
        data.originWarehouseId ??
        data.originWarehouse?.id ??
        data.originWarehouse?.warehouse_id ??
        null

      let warehouse: { name: string; code: string } | undefined
      if (data.originWarehouse?.name) {
        warehouse = {
          name: String(data.originWarehouse.name),
          code: String(data.originWarehouse.code ?? data.originWarehouse?.warehouse_code ?? ""),
        }
      } else if (data.origin_warehouse_name) {
        warehouse = {
          name: String(data.origin_warehouse_name),
          code: String(data.origin_warehouse_code ?? ""),
        }
      }

      if (!warehouse && originWarehouseId) {
        try {
          const resWh = await fetch("/api/warehouses")
          if (resWh.ok) {
            const list = await resWh.json()
            const found = Array.isArray(list)
              ? list.find((item: any) => {
                  const candidate =
                    item.warehouse_id ??
                    item.id ??
                    item.warehouseId ??
                    item?.warehouse?.id ??
                    item?.warehouseId ??
                    null
                  return Number(candidate) === Number(originWarehouseId)
                })
              : null
            if (found) {
              warehouse = {
                name: String(found.name ?? ""),
                code: String(found.code ?? found.warehouse_code ?? ""),
              }
            }
          }
        } catch {
          // ignore, will fall back to generic message
        }
      }

      setSuccess({ trackingCode: String(data.tracking_code), warehouse })
      setFormData(INITIAL_FORM)
      setPicked({})
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo đơn hàng thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <Link href="/dashboard/customer" className="inline-flex items-center gap-2 text-primary hover:text-[#00A8CC] mb-4">
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Tạo đơn hàng mới</h1>
          <p className="text-secondary">Nhập các thông tin bên dưới để chúng tôi tiếp nhận và xử lý đơn hàng của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-default bg-surface p-8">
          {success && (
            <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="font-medium text-emerald-400">
                Đơn hàng được tạo thành công.{" "}
                {success.warehouse ? (
                  <>
                    Đơn hàng của bạn sẽ được bàn giao cho kho{" "}
                    <span className="font-semibold text-foreground">“{success.warehouse.name}”</span>
                    {success.warehouse.code ? <> ({success.warehouse.code})</> : null} để xử lý.
                  </>
                ) : (
                  "Chúng tôi sẽ bàn giao đơn hàng tới kho gần nhất để xử lý."
                )}
              </div>
              <div className="mt-1 text-sm text-secondary">
                Mã vận đơn: <span className="font-mono text-foreground">{success.trackingCode}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/tracking/${success.trackingCode}`}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-background hover:bg-[#00A8CC]"
                >
                  Xem hành trình
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuccess(null)
                    setFee(null)
                  }}
                >
                  Tạo đơn khác
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-lg font-semibold">Thông tin người gửi</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tên người gửi</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-default bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Số điện thoại người gửi</label>
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-default bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Thông tin người nhận</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tên người nhận</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-default bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Số điện thoại người nhận</label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-default bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Địa chỉ lấy/giao</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Địa chỉ lấy hàng</label>
                  <textarea
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    className="w-full resize-none rounded-lg border border-default bg-background px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Địa chỉ giao hàng</label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    className="w-full resize-none rounded-lg border border-default bg-background px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button type="button" variant="outline" onClick={() => setUseMap((prev) => !prev)}>
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
                    <p className="mt-2 text-xs text-secondary">Di chuyển hai điểm đánh dấu để chọn tọa độ lấy và giao hàng.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="border-t border-default pt-6">
              <h2 className="mb-4 text-lg font-semibold">Khối lượng & cước phí</h2>
              <div className="grid items-end gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Khối lượng (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-default bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <div className="text-sm text-secondary">Cước dự kiến</div>
                  <div className="text-xl font-semibold">
                    {fee !== null ? `${fee.toLocaleString("vi-VN")} ₫` : "Chưa có dữ liệu"}
                  </div>
                </div>
                <div>
                  <Button type="button" variant="outline" onClick={handleFeePreview}>
                    Tính cước
                  </Button>
                </div>
              </div>
            </section>

            <div className="border-t border-default pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 font-medium text-background transition-colors hover:bg-[#00A8CC]"
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
