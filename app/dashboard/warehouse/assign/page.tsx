"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

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

  useEffect(() => {
    if (!whId) return
    setSelectedOrders([])
    setSelectedShipper(null)
    Promise.all([
      fetch(`/api/orders/warehouse/${whId}`).then(r => r.json()),
      fetch(`/api/warehouses/${whId}/shippers`).then(r => r.json()),
    ]).then(([o, s]) => {
      setOrders(o)
      setShippers(s)
    }).catch(() => { setOrders([]); setShippers([]) })
  }, [whId])

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleAssign = async () => {
    setError("")
    setInfo("")
    if (!selectedOrders.length || !selectedShipper) return
    setBusy(true)
    try {
      for (const oid of selectedOrders) {
        const res = await fetch(`/api/orders/${oid}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shipper_user_id: selectedShipper }),
        })
        if (!res.ok) {
          const data = await res.json(); throw new Error(data?.error || 'Lỗi phân công')
        }
      }
      setInfo(`Đã phân công ${selectedOrders.length} đơn`)
      setSelectedOrders([])
      const o = await fetch(`/api/orders/warehouse/${whId}`).then(r => r.json())
      setOrders(o)
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Phân công Shipper</h1>
          <p className="text-secondary">Chỉ xem và phân công trong kho của bạn</p>
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
                  {info && <span className="text-sm text-green-500">{info}</span>}
                  {error && <span className="text-sm text-red-500">{error}</span>}
                </div>
                <div className="divide-y divide-default max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.order_id} className={`p-6 transition-colors ${order.shipper_user_id ? 'opacity-60' : 'hover:bg-background cursor-pointer'}`} onClick={() => { if (!order.shipper_user_id) handleSelectOrder(order.order_id) }}>
                    <div className="flex items-start gap-4">
                      <input type="checkbox" checked={selectedOrders.includes(order.order_id)} onChange={() => {}} disabled={!!order.shipper_user_id} className="mt-1 w-4 h-4 rounded border-default cursor-pointer disabled:cursor-not-allowed" />
                      <div className="flex-1">
                        <p className="font-semibold text-primary">{order.tracking_code}</p>
                        <p className="text-secondary text-sm">Trạng thái: {order.current_status}</p>
                        {order.shipper_user_id && <p className="text-[12px] text-red-500">Đã được phân công shipper</p>}
                        <p className="text-secondary text-sm">Ngày tạo: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
                  {orders.length === 0 && (
                    <div className="p-6 text-sm text-secondary">Chưa có đơn nào trong kho để phân công.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
              <h3 className="font-semibold mb-6">Chọn Shipper</h3>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {shippers.map((shipper) => (
                  <button key={shipper.id} onClick={() => setSelectedShipper(shipper.id)} className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedShipper === shipper.id ? 'bg-primary/10 border-primary' : 'bg-background border-default hover:border-primary'}`}>
                    <p className="font-medium">{shipper.name}</p>
                    <p className="text-secondary text-sm">{shipper.phone}</p>
                  </button>
                ))}
                {shippers.length === 0 && (
                  <div className="text-sm text-secondary">Chưa có shipper nào thuộc kho của bạn.</div>
                )}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-default">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Đơn hàng chọn</span>
                  <span className="font-bold text-primary">{selectedOrders.length}</span>
                </div>
              </div>

              <Button onClick={handleAssign} disabled={!selectedOrders.length || !selectedShipper || busy} className="w-full bg-primary text-background hover:bg-[#00A8CC]">
                {busy ? 'Đang phân công...' : 'Phân công'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
