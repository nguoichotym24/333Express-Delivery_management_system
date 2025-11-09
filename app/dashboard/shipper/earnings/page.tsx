"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useMemo, useState, Fragment } from "react"
import { useRouter } from "next/navigation"

type ShipperOrder = {
  tracking_code?: string
  shipping_fee: number
  current_status: string
  created_at: string
  delivered_at: string | null
}

export default function EarningsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rows, setRows] = useState<ShipperOrder[]>([])
  const [busy, setBusy] = useState(true)
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'month' | 'year'>('today')
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

  const filteredDelivered = useMemo(() => {
    // delivered rows within selected time range
    const now = new Date()
    // quick range window
    if (range === 'today') {
      const s = new Date(now)
      s.setHours(0,0,0,0)
      return rows.filter(o => o.current_status === 'delivered' && new Date(o.delivered_at || o.created_at) >= s)
    }
    if (range === '7d') {
      const s = new Date(now)
      s.setDate(s.getDate() - 7)
      return rows.filter(o => o.current_status === 'delivered' && new Date(o.delivered_at || o.created_at) >= s)
    }
    if (range === '30d') {
      const s = new Date(now)
      s.setDate(s.getDate() - 30)
      return rows.filter(o => o.current_status === 'delivered' && new Date(o.delivered_at || o.created_at) >= s)
    }
    if (range === 'month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return rows.filter(o => o.current_status === 'delivered' && new Date(o.delivered_at || o.created_at) >= s)
    }
    if (range === 'year') {
      const s = new Date(now.getFullYear(), 0, 1)
      return rows.filter(o => o.current_status === 'delivered' && new Date(o.delivered_at || o.created_at) >= s)
    }
    return rows.filter(o => o.current_status === 'delivered')
  }, [rows, range])

  // Apply custom date range in addition to quick range
  const deliveredInWindow = useMemo(() => {
    if (!startDate && !endDate) return filteredDelivered
    const start = startDate ? new Date(startDate + 'T00:00:00') : null
    const end = endDate ? new Date(endDate + 'T23:59:59') : null
    return filteredDelivered.filter((o) => {
      const t = new Date(o.delivered_at || o.created_at)
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    })
  }, [filteredDelivered, startDate, endDate])

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; deliveries: number; revenue: number; commission: number; net: number }>()
    const COMMISSION_RATE = 0.25
    for (const o of deliveredInWindow) {
      const ts = o.delivered_at || o.created_at
      const d = new Date(ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`
      const fee = Number(o.shipping_fee || 0)
      if (!map.has(key)) map.set(key, { month: label, deliveries: 0, revenue: 0, commission: 0, net: 0 })
      const rec = map.get(key)!
      rec.deliveries += 1
      rec.revenue += fee
      rec.commission = rec.revenue * COMMISSION_RATE
      rec.net = rec.revenue - rec.commission
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([, v]) => v)
  }, [deliveredInWindow])

  // Dynamic breakdown for table: by day for today/7d/30d/month, by month for year/all
  const breakdown = useMemo(() => {
    const COMMISSION_RATE = 0.25
    type Row = { key: string; label: string; deliveries: number; revenue: number; commission: number; net: number }
    const map = new Map<string, Row>()
    const byDay = range === 'today' || range === '7d' || range === '30d' || range === 'month'
    for (const o of deliveredInWindow) {
      const d = new Date(o.delivered_at || o.created_at)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const key = byDay ? `${y}-${m}-${dd}` : `${y}-${m}`
      const label = byDay ? `${dd}/${m}/${y}` : `Tháng ${Number(m)}/${y}`
      if (!map.has(key)) map.set(key, { key, label, deliveries: 0, revenue: 0, commission: 0, net: 0 })
      const rec = map.get(key)!
      rec.deliveries += 1
      rec.revenue += Number(o.shipping_fee || 0)
      rec.commission = rec.revenue * COMMISSION_RATE
      rec.net = rec.revenue - rec.commission
    }
    const rows = Array.from(map.values())
    rows.sort((a, b) => (a.key < b.key ? 1 : -1))
    return rows
  }, [deliveredInWindow, range])

  const [detailKey, setDetailKey] = useState<string | null>(null)

  const totals = useMemo(() => {
    const t = { deliveries: 0, revenue: 0, commission: 0, net: 0 }
    for (const m of monthly) {
      t.deliveries += m.deliveries
      t.revenue += m.revenue
      t.commission += m.commission
      t.net += m.net
    }
    return t
  }, [monthly])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê thu nhập</h1>
          <p className="text-secondary">Xem thu nhập và hoa hồng của bạn</p>
        </div>

        {/* Range filters */}
        <div className="bg-surface border border-default rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {([
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

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Tổng giao hàng", value: busy ? '...' : String(totals.deliveries), color: "bg-blue-500/10 text-blue-400" },
            { label: "Tổng doanh thu", value: busy ? '...' : `${(totals.revenue / 1_000_000).toFixed(1)}M`, color: "bg-primary/10 text-primary" },
            { label: "Hoa hồng (25%)", value: busy ? '...' : `${(totals.commission / 1_000_000).toFixed(1)}M`, color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Thu nhập ròng (75%)", value: busy ? '...' : `${(totals.net / 1_000_000).toFixed(1)}M`, color: "bg-green-500/10 text-green-400" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">
                {
                  index === 0
                    ? (busy ? '...' : String(totals.deliveries))
                    : index === 1
                      ? (busy ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(totals.revenue || 0)))
                      : index === 2
                        ? (busy ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(totals.commission || 0)))
                        : (busy ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(totals.net || 0)))
                }
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default" hidden={range === 'today'}>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tháng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Số giao hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Doanh thu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hoa hồng (25%)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Thu nhập ròng (75%)</th>
                </tr>
                <tr className="border-b border-default" hidden={range !== 'today'}>
                  <th className="px-6 py-4 text-left text-sm font-semibold">MÃ vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phí vận chuyển</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Thời gian giao</th>
                </tr>
              </thead>
              <tbody>
                {range === 'today'
                  ? [...deliveredInWindow]
                      .sort((a, b) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime())
                      .map((o, idx) => (
                        <tr key={idx} className="border-b border-default hover:bg-background transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-primary">{(o as any).tracking_code || (new Date(o.delivered_at || o.created_at).toISOString().slice(0,10).replaceAll('-', '') + '-' + String(idx+1).padStart(4,'0'))}</td>
                          <td className="px-6 py-4 text-sm font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(Number(o.shipping_fee || 0)))}</td>
                          <td className="px-6 py-4 text-sm text-secondary">{new Date(o.delivered_at || o.created_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                  : breakdown.map((m, index) => (
                    <Fragment key={(m as any).key ?? index}>
                      <tr className="border-b border-default hover:bg-background transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{m.label}</td>
                        <td className="px-6 py-4 text-sm">{m.deliveries}</td>
                        <td className="px-6 py-4 text-sm font-medium text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(m.revenue || 0))}</td>
                        <td className="px-6 py-4 text-sm font-medium text-yellow-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(m.commission || 0))}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(m.net || 0))}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-primary hover:underline" onClick={() => setDetailKey(detailKey === (m as any).key ? null : (m as any).key)}>
                            {detailKey === (m as any).key ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                          </button>
                        </td>
                      </tr>
                      {detailKey === (m as any).key && (
                        <tr className="border-b border-default bg-background/50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-secondary">
                                    <th className="text-left py-2">Mã vận đơn</th>
                                    <th className="text-left py-2">Phí vận chuyển</th>
                                    <th className="text-left py-2">Thời gian giao</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {deliveredInWindow
                                    .filter(o => {
                                      const d = new Date(o.delivered_at || o.created_at)
                                      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
                                      return key === (m as any).key
                                    })
                                    .sort((a, b) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime())
                                    .map((o, idx2) => (
                                      <tr key={idx2} className="border-t border-default">
                                        <td className="py-2 font-medium text-primary">{(o as any).tracking_code || 'N/A'}</td>
                                        <td className="py-2">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(Number(o.shipping_fee || 0)))}</td>
                                        <td className="py-2 text-secondary">{new Date(o.delivered_at || o.created_at).toLocaleString('vi-VN')}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
