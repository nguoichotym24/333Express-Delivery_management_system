"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type OrderRow = {
  order_id: number
  tracking_code: string
  current_status: string
  created_at: string
}

export default function StatusPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [status, setStatus] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  useEffect(() => {
    fetch('/api/orders/shipper')
      .then(r => r.json())
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
  }, [])

  const statuses = [
    { value: 'picked_up', label: 'Đã lấy hàng' },
    { value: 'out_for_delivery', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Giao hàng thành công' },
    { value: 'delivery_failed', label: 'Giao hàng thất bại' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!selectedOrder || !status) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Cập nhật thất bại')
      setSuccess('Cập nhật trạng thái thành công')
      const list = await fetch('/api/orders/shipper').then(r => r.json())
      setOrders(list)
      setNotes("")
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cập nhật trạng thái giao hàng</h1>
          <p className="text-secondary">Chọn đơn hàng và cập nhật trạng thái</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Chọn đơn hàng</h3>
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.order_id}
                    type="button"
                    onClick={() => setSelectedOrder(order.order_id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedOrder === order.order_id ? 'bg-primary/10 border-primary' : 'bg-background border-default hover:border-primary'}`}
                  >
                    <p className="font-medium text-primary">{order.tracking_code}</p>
                    <p className="text-secondary text-sm">Trạng thái: {order.current_status}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Chọn trạng thái</h3>
              <div className="space-y-3">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${status === s.value ? 'bg-primary/10 border-primary' : 'bg-background border-default hover:border-primary'}`}
                  >
                    <p className="font-medium">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Ghi chú</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về giao hàng"
                rows={4}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
            <h3 className="font-semibold mb-6">Tóm tắt</h3>
            <div className="space-y-4 mb-6 pb-6 border-b border-default">
              <div>
                <p className="text-secondary text-sm mb-1">Đơn hàng</p>
                <p className="font-medium text-primary">{orders.find(o => o.order_id === selectedOrder)?.tracking_code || 'Chưa chọn'}</p>
              </div>
              <div>
                <p className="text-secondary text-sm mb-1">Trạng thái</p>
                <p className="font-medium">{statuses.find((s) => s.value === status)?.label || 'Chưa chọn'}</p>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

            <Button type="submit" disabled={!selectedOrder || !status || submitting} className="w-full bg-primary text-background hover:bg-[#00A8CC]">
              {submitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}