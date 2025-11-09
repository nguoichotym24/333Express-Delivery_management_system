"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Check, CheckCircle, XCircle, Truck, MapPin, Clock, RotateCcw, AlertTriangle, FilePlus, PackageCheck, Bolt } from "lucide-react"
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

  const themeFor = (code: string) => {
    const danger = new Set(["delivery_failed", "cancelled", "lost"])
    const success = new Set(["delivered", "returned_to_origin"]) // success-like
    const progress = new Set([
      "out_for_delivery",
      "in_transit_to_sorting_center",
      "in_transit_to_destination_hub",
      "return_in_transit",
    ])
    const waiting = new Set(["created", "waiting_for_pickup", "picked_up"]) 
    const arrived = new Set(["arrived_at_origin_hub", "arrived_at_sorting_hub", "arrived_at_destination_hub", "returned_to_destination_hub"]) 

    if (danger.has(code)) return { bg: "bg-red-500/10", text: "text-red-600" }
    if (success.has(code)) return { bg: "bg-green-500/10", text: "text-green-600" }
    if (arrived.has(code)) return { bg: "bg-purple-500/10", text: "text-purple-600" }
    if (progress.has(code)) return { bg: "bg-blue-500/10", text: "text-blue-600" }
    if (waiting.has(code)) return { bg: "bg-amber-500/10", text: "text-amber-600" }
    return { bg: "bg-primary/10", text: "text-primary" }
  }

  const iconFor = (code: string) => {
    if (code === "lost") return AlertTriangle
    if (code === "delivery_failed" || code === "cancelled") return XCircle
    if (code === "delivered") return CheckCircle
    if (code === "out_for_delivery" || code === "in_transit_to_sorting_center" || code === "in_transit_to_destination_hub") return Truck
    if (code === "picked_up") return PackageCheck
    if (code.startsWith("arrived_at") || code === "returned_to_destination_hub") return MapPin
    if (code === "waiting_for_pickup") return Clock
    if (code === "return_in_transit" || code === "returned_to_origin") return RotateCcw
    if (code === "created") return FilePlus
    return Bolt
  }

  const circleThemeFor = (code: string) => {
    if (code === "delivery_failed" || code === "cancelled" || code === "lost") {
      return { bg: "bg-red-500", ring: "ring-red-500/30", text: "text-white", line: "bg-red-500/40" }
    }
    if (code === "delivered" || code === "returned_to_origin") {
      return { bg: "bg-green-500", ring: "ring-green-500/30", text: "text-white", line: "bg-green-500/40" }
    }
    if (
      code === "out_for_delivery" ||
      code === "in_transit_to_sorting_center" ||
      code === "in_transit_to_destination_hub"
    ) {
      return { bg: "bg-blue-500", ring: "ring-blue-500/30", text: "text-white", line: "bg-blue-500/40" }
    }
    if (
      code === "arrived_at_origin_hub" ||
      code === "arrived_at_sorting_hub" ||
      code === "arrived_at_destination_hub" ||
      code === "returned_to_destination_hub"
    ) {
      return { bg: "bg-purple-500", ring: "ring-purple-500/30", text: "text-white", line: "bg-purple-500/40" }
    }
    if (code === "created" || code === "waiting_for_pickup" || code === "picked_up") {
      return { bg: "bg-amber-500", ring: "ring-amber-500/30", text: "text-white", line: "bg-amber-500/40" }
    }
    return { bg: "bg-primary", ring: "ring-primary/30", text: "text-background", line: "bg-primary/40" }
  }

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
            {(() => { const t = themeFor(order.current_status); const Icon = iconFor(order.current_status); return (
              <p className="text-xl font-semibold">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${t.bg} ${t.text}`}>
                  <Icon className="w-4 h-4" />
                  {statusLabel(order.current_status)}
                </span>
              </p>
            )})()}
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
                  {(() => {
                    const Icon = iconFor(e.status)
                    const dot = circleThemeFor(e.status)
                    return (
                      <>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-2 ${dot.bg} ${dot.text} ${dot.ring}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        {i < timeline.length - 1 && (
                          <div className={`w-px h-10 my-1 ${dot.line}`}></div>
                        )}
                      </>
                    )
                  })()}
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
