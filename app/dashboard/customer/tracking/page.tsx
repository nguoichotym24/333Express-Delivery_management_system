"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { statusLabel } from "@/lib/status"

const RouteMap = dynamic(() => import("@/components/map/route-map-client"), { ssr: false })

type OrderHistoryItem = {
  order_status_history_id: number
  status: string
  note: string | null
  warehouse_name?: string | null
  created_at: string
}

type OrderResponse = {
  order_id: number
  tracking_code: string
  sender_name: string
  sender_phone: string
  sender_address: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  created_at: string
  current_status: string
  history: OrderHistoryItem[]
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [route, setRoute] = useState<any | null>(null)

  const handleSearch = async () => {
    setError("")
    setOrder(null)
    setRoute(null)
    const code = trackingNumber.trim()
    if (!code) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/public/track/${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Không tìm thấy đơn hàng")
      setOrder(data)
      try {
        const r2 = await fetch(`/api/orders/${encodeURIComponent(code)}/route`)
        const d2 = await r2.json()
        if (r2.ok) setRoute(d2)
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const timeline = useMemo(() => {
    if (!order) return [] as Array<{ label: string; time: Date }>
    const noWarehouseStatuses = new Set([
      "created",
      "out_for_delivery",
      "delivered",
      "delivery_failed",
      "return_in_transit",
      "cancelled",
      "lost",
    ])
    return (order.history || []).map((h) => {
      const base = statusLabel(h.status)
      const label = noWarehouseStatuses.has(h.status)
        ? base
        : h.warehouse_name
        ? `${base} – ${h.warehouse_name}`
        : base
      return { label, time: new Date(h.created_at) }
    })
  }, [order])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Theo dõi đơn hàng</h1>
          <p className="text-secondary">Nhập mã vận đơn để theo dõi đơn hàng của bạn</p>
        </div>

        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nhập mã vận đơn (VD: VN20251024-0001)"
              className="flex-1 bg-background border border-default rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSearch} disabled={loading} className="bg-primary text-background hover:bg-[#00A8CC] px-8">
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </div>

        {order ? (
          <div className="space-y-6">
            <div className="bg-surface border border-default rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-secondary text-sm mb-2">Mã vận đơn</p>
                  <p className="text-2xl font-bold text-primary">{order.tracking_code}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm mb-2">Trạng thái</p>
                  <div className="inline-block px-4 py-2 rounded-lg font-medium bg-primary/10 text-primary">
                    {statusLabel(order.current_status)}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Người gửi</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.sender_name}</p>
                    <p className="text-secondary">{order.sender_address}</p>
                    <p className="text-secondary">{order.sender_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Người nhận</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.receiver_name}</p>
                    <p className="text-secondary">{order.receiver_address}</p>
                    <p className="text-secondary">{order.receiver_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Lịch sử cập nhật</h3>
              <div className="space-y-4">
                {timeline.map((e, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      {index < timeline.length - 1 && <div className="w-0.5 h-12 bg-default mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">{e.label}</p>
                      <p className="text-secondary text-sm">{e.time.toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-secondary text-sm">Chưa có lịch sử trạng thái.</p>
                )}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Bản đồ tuyến đường</h3>
              {route ? (
                <RouteMap
                  height={360}
                  sender={route.sender}
                  receiver={route.receiver}
                  currentWarehouse={route.currentWarehouse || undefined}
                  route={route.route}
                  followRoads
                  lastUpdate={(route as any).lastUpdate || route.currentWarehouse || undefined}
                />
              ) : (
                <p className="text-secondary text-sm">Chưa có dữ liệu bản đồ.</p>
              )}
            </div>
          </div>
        ) : !loading && trackingNumber ? (
          <div className="bg-surface border border-default rounded-xl p-8 text-center">
            <p className="text-secondary">Không tìm thấy đơn hàng với mã vận đơn này</p>
          </div>
        ) : (
          <div className="bg-surface border border-default rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔎</span>
            </div>
            <p className="text-secondary">Nhập mã vận đơn để bắt đầu theo dõi</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

