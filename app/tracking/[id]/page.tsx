"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Package, CheckCircle } from "lucide-react"
import { useParams } from "next/navigation"

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
}

const RouteMap = dynamic(() => import("@/components/map/route-map-client"), { ssr: false })

const STATUS_LABELS: Record<string, string> = {
  created: "Người gửi đã tạo đơn",
  waiting_for_pickup: "Chờ lấy hàng",
  picked_up: "Đã lấy hàng",
  arrived_at_origin_hub: "Đã đến kho gửi",
  in_transit_to_sorting_center: "Đang đến kho trung tâm",
  arrived_at_sorting_hub: "Đã đến kho trung tâm",
  in_transit_to_destination_hub: "Đang đến kho đích",
  arrived_at_destination_hub: "Đã đến kho đích",
  out_for_delivery: "Đang giao hàng",
  delivered: "Giao hàng thành công",
  delivery_failed: "Giao hàng thất bại",
  returned_to_destination_hub: "Trả về kho đích",
  return_in_transit: "Đang hoàn hàng",
  returned_to_origin: "Đã hoàn về kho gửi",
  cancelled: "Đã hủy",
  lost: "Thất lạc",
}

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

    // Fetch route for map
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
    return order.history.map((h: OrderHistoryItem) => {
      const base = STATUS_LABELS[h.status] || h.status
      const label = h.status === 'created' ? base : (h.warehouse_name ? `${base} — ${h.warehouse_name}` : base)
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
        <div className="text-center">
          <p className="text-secondary mb-6">Không tìm thấy đơn hàng</p>
          <Link href="/">
            <Button className="bg-primary text-background hover:bg-[#00A8CC]">Quay lại trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-default">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-[#00A8CC] mb-6">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold mb-2">Tra cứu đơn hàng</h1>
          <p className="text-secondary">
            Mã đơn hàng: <span className="text-primary font-mono">{trackingId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="bg-surface border border-default rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-secondary text-sm">Người nhận</p>
                  <p className="font-semibold">{order.receiver_name}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Số điện thoại</p>
                  <p className="font-semibold">{order.receiver_phone}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Địa chỉ gửi</p>
                  <p className="font-semibold">{order.sender_address}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Địa chỉ nhận</p>
                  <p className="font-semibold">{order.receiver_address}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Lịch sử đơn hàng</h2>
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${"bg-primary"}`}>
                        <CheckCircle className="w-6 h-6 text-background" />
                      </div>
                      {index < timeline.length - 1 && <div className={`w-1 h-12 bg-primary`}></div>}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold">{event.label}</p>
                      <p className="text-secondary text-sm">{event.time.toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-surface border border-default rounded-xl p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Bản đồ vận chuyển</h2>
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
                <p className="text-secondary text-sm">Không có dữ liệu bản đồ</p>
              )}
            </div>
          </div>

          <div>
            <div className="bg-surface border border-default rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">Trạng thái</h3>
              <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
                {(() => {
                  const base = STATUS_LABELS[order.current_status] || order.current_status
                  const last = order.history?.length ? (order.history[order.history.length - 1] as OrderHistoryItem) : null
                  const text = order.current_status === 'created' ? base : (last?.warehouse_name ? `${base} — ${last.warehouse_name}` : base)
                  return <p className="text-primary font-semibold text-center">{text}</p>
                })()}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-secondary text-sm">Ngày tạo</p>
                  <p className="font-semibold">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>

              <Link href="/signup" className="w-full mt-6">
                <Button className="w-full bg-primary text-background hover:bg-[#00A8CC]">Đăng ký để quản lý</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
