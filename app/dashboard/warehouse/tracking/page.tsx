"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

const RouteMap = dynamic(() => import("@/components/map/route-map-client"), { ssr: false })

type Warehouse = { id: number; code: string; name: string; lat: number; lng: number }

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
  returned_to_origin: "Đã hoàn về kho gốc",
  cancelled: "Đã hủy",
  lost: "Thất lạc",
}

export default function TrackingPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [whId, setWhId] = useState<number | null>(null)
  const [rows, setRows] = useState<OrderRow[]>([])
  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [route, setRoute] = useState<any | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/warehouses")
      .then((r) => r.json())
      .then((list) => {
        const ws = list.map((w: any) => ({ id: w.id, code: w.code, name: w.name, lat: Number(w.lat), lng: Number(w.lng) }))
        setWarehouses(ws)
        if (ws.length && whId === null) setWhId(ws[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!whId) return
    setSelected(null)
    setRoute(null)
    setLoading(true)
    fetch(`/api/orders/warehouse/${whId}`)
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [whId])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/orders/${encodeURIComponent(selected.tracking_code)}/route`)
      .then((r) => r.json())
      .then(setRoute)
      .catch(() => setRoute(null))
  }, [selected])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((o) => {
      if (statusFilter && o.current_status !== statusFilter) return false
      if (!q) return true
      return o.tracking_code.toLowerCase().includes(q)
    })
  }, [rows, statusFilter, query])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Theo dõi hàng trong kho</h1>
          <p className="text-secondary">Xem trạng thái và tuyến hàng hóa theo kho</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-secondary">Kho</label>
          <select
            className="bg-background border border-default rounded-lg px-3 py-2 text-sm"
            value={whId ?? ""}
            onChange={(e) => setWhId(Number(e.target.value))}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          <label className="text-sm text-secondary ml-4">Trạng thái</label>
          <select
            className="bg-background border border-default rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            {Object.keys(STATUS_LABELS).map((k) => (
              <option key={k} value={k}>
                {STATUS_LABELS[k]}
              </option>
            ))}
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mã vận đơn"
            className="bg-background border border-default rounded-lg px-3 py-2 text-sm flex-1 min-w-56"
          />
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
                {loading ? (
                  <tr><td className="px-6 py-6" colSpan={3}><div className="space-y-3"><div className="bg-accent animate-pulse h-5 w-1/2 rounded" /><div className="bg-accent animate-pulse h-5 w-2/3 rounded" /><div className="bg-accent animate-pulse h-5 w-1/3 rounded" /></div></td></tr>
                ) : filteredRows.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b border-default hover:bg-background transition-colors cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.tracking_code}</td>
                    <td className="px-6 py-4 text-sm">{STATUS_LABELS[order.current_status] || order.current_status}</td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
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
