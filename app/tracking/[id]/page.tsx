"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { statusLabel } from "@/lib/status"

type OrderHistoryItem = {
  order_status_history_id: number
  order_id: number
  status: string
  note: string | null
  warehouse_id: number | null
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

type RouteResponse = {
  sender: { lat: number; lng: number }
  receiver: { lat: number; lng: number }
  currentWarehouse: { lat: number; lng: number; name?: string } | null
  route: Array<{ lat: number; lng: number; label?: string }>
  lastUpdate?: { lat: number; lng: number } | null
}

const RouteMap = dynamic(() => import("@/components/map/route-map-client"), { ssr: false })

export default function TrackingPage() {
  const params = useParams()
  const trackingId = params.id as string
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteResponse | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/orders/public/track/${encodeURIComponent(trackingId)}`)
      .then(async (r) => {
        const data = await r.json()
        if (!active) return
        if (r.ok) setOrder(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`/api/orders/${encodeURIComponent(trackingId)}/route`)
      .then(async (r) => {
        const data = await r.json()
        if (!active) return
        if (r.ok) setRoute(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [trackingId])

  const timeline = useMemo(() => {
    if (!order) return [] as Array<{ label: string; time: Date; status: string }>
    const noWarehouseStatuses = new Set([
      "created",
      "out_for_delivery",
      "delivered",
      "delivery_failed",
      "return_in_transit",
      "cancelled",
      "lost",
    ])
    return order.history.map((h: OrderHistoryItem) => {
      const base = statusLabel(h.status)
      const label = noWarehouseStatuses.has(h.status)
        ? base
        : h.warehouse_name
        ? `${base} – ${h.warehouse_name}`
        : base
      return { status: h.status, label, time: new Date(h.created_at) }
    })
  }, [order])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <p className="text-lg font-semibold">Không tìm thấy đơn hàng</p>
          <Link href="/">
            <Button className="bg-primary text-background hover:bg-[#00A8CC]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-default">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Trang chủ
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Theo dõi đơn hàng</h1>
          <p className="text-secondary">Mã vận đơn: {order.tracking_code}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface border border-default rounded-xl p-6">
            <p className="text-secondary text-sm mb-2">Trạng thái hiện tại</p>
            <p className="text-xl font-semibold">{statusLabel(order.current_status)}</p>
          </div>
          <div className="bg-surface border border-default rounded-xl p-6">
            <p className="text-secondary text-sm mb-2">Thời gian tạo</p>
            <p className="text-xl font-semibold">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl p-6">
          <h3 className="font-semibold mb-6">Lịch sử cập nhật</h3>
          <div className="space-y-4">
            {timeline.map((e, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  {i < timeline.length - 1 && <div className="w-0.5 h-10 bg-default mt-2"></div>}
                </div>
                <div className="pb-4">
                  <p className="font-medium">{e.label}</p>
                  <p className="text-secondary text-sm">{e.time.toLocaleString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl p-6">
          <h3 className="font-semibold mb-4">Bản đồ</h3>
          {route ? (
            <RouteMap
              height={400}
              sender={route.sender}
              receiver={route.receiver}
              currentWarehouse={route.currentWarehouse || undefined}
              route={route.route}
              followRoads
              lastUpdate={route.lastUpdate || route.currentWarehouse || undefined}
            />
          ) : (
            <p className="text-secondary text-sm">Không có dữ liệu bản đồ.</p>
          )}
        </div>
      </div>
    </div>
  )
}

