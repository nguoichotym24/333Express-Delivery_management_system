"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { statusLabel } from "@/lib/status"

type Order = {
  order_id: number
  tracking_code: string
  current_status: string
  sender_name: string
  created_at: string
  shipping_fee: number
  total_amount: number | null
}

export default function HistoryPage() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const filter = (searchParams.get('filter') || '').toLowerCase()

  useEffect(() => {
    setLoading(true)
    fetch("/api/orders/customer")
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const categorize = (status: string): 'delivered' | 'delivering' | 'pending' | 'failed' => {
    const pendingSet = new Set(['created', 'waiting_for_pickup'])
    const failedSet = new Set(['delivery_failed', 'cancelled', 'lost', 'returned_to_origin'])
    if (status === 'delivered') return 'delivered'
    if (failedSet.has(status)) return 'failed'
    if (pendingSet.has(status)) return 'pending'
    return 'delivering'
  }

  const filtered = useMemo(() => {
    if (!filter || filter === 'all' || filter === 'total' || filter === 'spend') return rows
    const allowed = new Set(['delivered','delivering','pending','failed'])
    if (!allowed.has(filter as any)) return rows
    return rows.filter((r) => categorize(r.current_status) === filter)
  }, [rows, filter])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử đơn hàng</h1>
          <p className="text-secondary">Xem tất cả đơn hàng của bạn{filter ? ` (lọc: ${filter})` : ''}</p>
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Người gửi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phí vận chuyển</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tạo</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-secondary text-sm" colSpan={6}>
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
                {filtered.map((o) => (
                  <tr key={o.order_id} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{o.tracking_code}</td>
                    <td className="px-6 py-4 text-sm">{o.sender_name}</td>
                    <td className="px-6 py-4 text-sm">{statusLabel(o.current_status)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {Number(o.shipping_fee || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {new Date(o.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link href={`/tracking/${o.tracking_code}`} className="text-primary hover:underline">
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

