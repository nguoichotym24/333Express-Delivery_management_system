"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { statusLabel } from "@/lib/status"

type ShipperOrder = {
  order_id: number
  tracking_code: string
  current_status: string
  shipping_fee: number
  created_at: string
  delivered_at?: string | null
}

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rows, setRows] = useState<ShipperOrder[]>([])
  const [busy, setBusy] = useState(true)
  const [range, setRange] = useState<'all' | 'today' | '7d' | '30d' | 'month' | 'year'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Role guard
  useEffect(() => {
    if (!loading && user && user.role !== 'shipper') {
      router.replace(`/dashboard/${user.role}`)
    }
  }, [user, loading, router])

  useEffect(() => {
    setBusy(true)
    fetch('/api/orders/shipper')
      .then(r => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setBusy(false))
  }, [])

  const history = useMemo(() => {
    const allowed = new Set(['delivered', 'delivery_failed'])
    const now = new Date()
    let start: Date | null = null
    if (range === 'today') { const s = new Date(now); s.setHours(0,0,0,0); start = s }
    else if (range === '7d') { const s = new Date(now); s.setDate(s.getDate()-7); start = s }
    else if (range === '30d') { const s = new Date(now); s.setDate(s.getDate()-30); start = s }
    else if (range === 'month') { start = new Date(now.getFullYear(), now.getMonth(), 1) }
    else if (range === 'year') { start = new Date(now.getFullYear(), 0, 1) }
    let list = rows.filter((r) => {
      if (!allowed.has(r.current_status)) return false
      if (!start) return true
      const t = new Date(r.delivered_at || r.created_at)
      return t >= start
    })
    // apply custom date range
    if (startDate) {
      const s = new Date(startDate + 'T00:00:00')
      list = list.filter(r => new Date(r.delivered_at || r.created_at) >= s)
    }
    if (endDate) {
      const e = new Date(endDate + 'T23:59:59')
      list = list.filter(r => new Date(r.delivered_at || r.created_at) <= e)
    }
    return list
  }, [rows, range, startDate, endDate])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử giao hàng</h1>
          <p className="text-secondary">Các đơn đã giao hoặc giao thất bại</p>
        </div>

        {/* Range filters */}
        <div className="bg-surface border border-default rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {([
              { k: 'all', label: 'Tất cả' },
              { k: 'today', label: 'Hôm nay' },
              { k: '7d', label: '7 ngày' },
              { k: '30d', label: '30 ngày' },
              { k: 'month', label: 'Tháng này' },
              { k: 'year', label: 'Năm nay' },
            ] as const).map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setRange(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === k ? 'bg-primary text-background' : 'bg-background border border-default hover:border-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <label className="text-sm text-secondary">Từ ngày</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background border border-default rounded px-2 py-1 text-sm" />
            <label className="text-sm text-secondary">Đến ngày</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background border border-default rounded px-2 py-1 text-sm" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate('') }} className="px-3 py-1.5 text-sm rounded bg-background border border-default hover:border-primary">Xóa</button>
            )}
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phí vận chuyển</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {!busy && history.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-secondary text-sm" colSpan={4}>Chưa có lịch sử giao hàng</td>
                  </tr>
                )}
                {history.map((o) => (
                  <tr key={o.order_id} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{o.tracking_code}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${o.current_status === 'delivered' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {statusLabel(o.current_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{Number(o.shipping_fee || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-6 py-4 text-sm text-secondary">{new Date(o.delivered_at || o.created_at).toLocaleDateString('vi-VN')}</td>
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
