"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

const RouteMap = dynamic(() => import("@/components/map/route-map-client"), { ssr: false })

type OrderRow = {
  order_id: number
  tracking_code: string
  current_status: string
  sender_lat: number
  sender_lng: number
  receiver_lat: number
  receiver_lng: number
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  created: 'Người gửi đã tạo đơn',
  waiting_for_pickup: 'Chờ lấy hàng',
  picked_up: 'Đã lấy hàng',
  arrived_at_origin_hub: 'Đã đến kho gửi',
  in_transit_to_sorting_center: 'Đang đến kho trung tâm',
  arrived_at_sorting_hub: 'Đã đến kho trung tâm',
  in_transit_to_destination_hub: 'Đang đến kho đích',
  arrived_at_destination_hub: 'Đã đến kho đích',
  out_for_delivery: 'Đang giao hàng',
  delivered: 'Giao hàng thành công',
  delivery_failed: 'Giao hàng thất bại',
  returned_to_destination_hub: 'Trả về kho đích',
  return_in_transit: 'Đang hoàn hàng',
  returned_to_origin: 'Đã hoàn về kho gửi',
  cancelled: 'Đã hủy',
  lost: 'Thất lạc',
}

export default function DeliveriesPage() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [route, setRoute] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/orders/shipper')
      .then(r => r.json())
      .then((data) => setRows(data))
      .catch(() => setRows([]))
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter(r => r.current_status === filter)
  }, [rows, filter])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/orders/${encodeURIComponent(selected.tracking_code)}/route`)
      .then(r => r.json())
      .then(setRoute)
      .catch(() => setRoute(null))
  }, [selected])

  const statuses = ['all', 'waiting_for_pickup', 'picked_up', 'in_transit_to_destination_hub', 'out_for_delivery', 'delivered', 'delivery_failed']

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Danh sách giao hàng</h1>
          <p className="text-secondary">Đơn hàng được giao cho bạn</p>
        </div>

        <div className="bg-surface border border-default rounded-xl p-6">
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-background' : 'bg-background border border-default text-foreground hover:border-primary'}`}
              >
                {s === 'all' ? 'Tất cả' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.order_id} className="border-b border-default hover:bg-background transition-colors cursor-pointer" onClick={() => setSelected(order)}>
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.tracking_code}</td>
                    <td className="px-6 py-4 text-sm">{STATUS_LABELS[order.current_status] || order.current_status}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Bản đồ</h2>
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
            <p className="text-secondary text-sm">Chọn một đơn để xem tuyến đường.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
