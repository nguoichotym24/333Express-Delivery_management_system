"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type OrderRow = { order_id: number; tracking_code: string; current_status: string; created_at: string; shipper_user_id?: number | null }
type ShipperRow = { id: number; name: string; email: string; phone: string }

export default function AssignPage() {
  const { user } = useAuth()
  const whId = user?.warehouse_id ?? null
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [shippers, setShippers] = useState<ShipperRow[]>([])
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [selectedShipper, setSelectedShipper] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [query, setQuery] = useState("")
  const [onlyReady, setOnlyReady] = useState(true)
  const [onlyUnassigned, setOnlyUnassigned] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!whId) return
    setSelectedOrders([])
    setSelectedShipper(null)
    setLoading(true)
    Promise.all([
      fetch(`/api/orders/warehouse/${whId}`).then((r) => r.json()),
      fetch(`/api/warehouses/${whId}/shippers`).then((r) => r.json()),
    ])
      .then(([o, s]) => {
        setOrders(Array.isArray(o) ? o : [])
        setShippers(Array.isArray(s) ? s : [])
      })
      .catch(() => {
        setOrders([])
        setShippers([])
      })
      .finally(() => setLoading(false))
  }, [whId])

  const isEligibleForAssign = (o: OrderRow) => o.current_status === "arrived_at_destination_hub" && !o.shipper_user_id

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (onlyReady && o.current_status !== "arrived_at_destination_hub") return false
      if (onlyUnassigned && o.shipper_user_id) return false
      if (!q) return true
      return o.tracking_code.toLowerCase().includes(q)
    })
  }, [orders, query, onlyReady, onlyUnassigned])

  const toggleOrder = (orderId: number) => {
    const order = orders.find((x) => x.order_id === orderId)
    if (!order || !isEligibleForAssign(order)) return
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleAssign = async () => {
    setError("")
    setInfo("")
    if (!selectedOrders.length) {
      toast({ title: "Thiếu thông tin", description: "Chưa chọn đơn để phân công" })
      setError("Chưa chọn đơn để phân công")
      return
    }
    if (!selectedShipper) {
      toast({ title: "Thiếu thông tin", description: "Chưa chọn shipper" })
      setError("Chưa chọn shipper")
      return
    }
    const invalid = selectedOrders
      .map((id) => orders.find((o) => o.order_id === id)!)
      .filter((o) => !isEligibleForAssign(o))
    if (invalid.length) {
      toast({ title: "Không hợp lệ", description: `Có ${invalid.length} đơn không hợp lệ để phân công` })
      setError(`Có ${invalid.length} đơn không hợp lệ để phân công`)
      return
    }
    setBusy(true)
    try {
      for (const oid of selectedOrders) {
        const res = await fetch(`/api/orders/${oid}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipper_user_id: selectedShipper }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || "Lỗi phân công")
        }
      }
      toast({ title: "Thành công", description: `Đã phân công ${selectedOrders.length} đơn` })
      setInfo(`Đã phân công ${selectedOrders.length} đơn`)
      setSelectedOrders([])
      const o = await fetch(`/api/orders/warehouse/${whId}`).then((r) => r.json())
      setOrders(Array.isArray(o) ? o : [])
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message || "Có lỗi xảy ra" })
      setError(e.message || "Có lỗi xảy ra")
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Phân công Shipper</h1>
          <p className="text-secondary">Chọn đơn và gán shipper trong kho của bạn</p>
        </div>

        {!whId && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-700">
            Tài khoản kho của bạn chưa gán kho (warehouse_id). Vui lòng liên hệ admin.
          </div>
        )}

        {whId && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-surface border border-default rounded-xl overflow-hidden">
                <div className="p-6 border-b border-default flex items-center justify-between">
                  <h3 className="font-semibold">Đơn hàng trong kho</h3>
                  <div className="flex items-center gap-3">
                    {info && <span className="text-sm text-green-500">{info}</span>}
                    {error && <span className="text-sm text-red-500">{error}</span>}
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm mã vận đơn"
                    className="bg-background border border-default rounded-lg px-3 py-2 text-sm flex-1"
                  />
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.target.checked)} />
                    Chỉ đơn sẵn sàng giao
                  </label>
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={onlyUnassigned} onChange={(e) => setOnlyUnassigned(e.target.checked)} />
                    Chỉ đơn chưa phân công
                  </label>
                </div>
                {loading ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="divide-y divide-default max-h-96 overflow-y-auto">
                    {filteredOrders.map((order) => {
                      const selectable = isEligibleForAssign(order)
                      const checked = selectedOrders.includes(order.order_id)
                      return (
                        <div
                          key={order.order_id}
                          className={`p-6 transition-colors ${selectable ? "hover:bg-background cursor-pointer" : "opacity-60"}`}
                          onClick={() => selectable && toggleOrder(order.order_id)}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              disabled={!selectable}
                              className="mt-1 w-4 h-4 rounded border-default cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-primary">{order.tracking_code}</p>
                              <p className="text-secondary text-sm">Trạng thái: {order.current_status}</p>
                              {order.shipper_user_id && (
                                <p className="text-[12px] text-red-500">Đã được phân công shipper</p>
                              )}
                              <p className="text-secondary text-sm">
                                Ngày tạo: {new Date(order.created_at).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {filteredOrders.length === 0 && (
                      <div className="p-6 text-sm text-secondary">Không có đơn phù hợp</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6 space-y-4">
              <h3 className="font-semibold mb-2">Chọn shipper</h3>
              <select
                className="bg-background border border-default rounded-lg px-3 py-2 text-sm w-full"
                value={selectedShipper ?? ""}
                onChange={(e) => setSelectedShipper(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Chọn shipper --</option>
                {shippers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>

              <div className="text-sm text-secondary">Đã chọn: {selectedOrders.length} đơn</div>

              <Button
                onClick={handleAssign}
                disabled={!selectedOrders.length || !selectedShipper || busy}
                className="w-full bg-primary text-background hover:bg-[#00A8CC]"
              >
                {busy ? "Đang phân công..." : "Phân công"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}