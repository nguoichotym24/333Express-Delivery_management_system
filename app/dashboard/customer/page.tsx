"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Search, Clock } from "lucide-react"

type Order = {
  order_id: number
  tracking_code: string
  current_status: string
  sender_name: string
  created_at: string
  shipping_fee: number
  total_amount: number | null
}

function formatCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "0"
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  return amount.toLocaleString("vi-VN") + " ₫"
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/orders/customer')
      .then(r => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const pendingSet = new Set(['created', 'waiting_for_pickup'])
    const failedSet = new Set(['delivery_failed', 'cancelled', 'lost', 'returned_to_origin'])
    let total = 0
    let delivered = 0
    let delivering = 0
    let pending = 0
    let failed = 0
    let spend = 0
    for (const o of orders) {
      total += 1
      const st = o.current_status
      if (st === 'delivered') delivered++
      else if (failedSet.has(st)) failed++
      else if (pendingSet.has(st)) pending++
      else delivering++
      const amount = (o.total_amount ?? o.shipping_fee ?? 0)
      spend += Number(amount)
    }
    return { total, delivered, delivering, pending, failed, spend }
  }, [orders])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển Khách hàng</h1>
          <p className="text-secondary">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Tổng đơn hàng", value: loading ? '...' : String(stats.total), color: "bg-gray-500/10 text-gray-400", href: "/dashboard/customer/history?filter=total" },
            { label: "Đơn hàng hoàn thành", value: loading ? '...' : String(stats.delivered), color: "bg-green-500/10 text-green-400", href: "/dashboard/customer/history?filter=delivered" },
            { label: "Đang giao", value: loading ? '...' : String(stats.delivering), color: "bg-blue-500/10 text-blue-400", href: "/dashboard/customer/history?filter=delivering" },
            { label: "Chờ xử lý", value: loading ? '...' : String(stats.pending), color: "bg-yellow-500/10 text-yellow-400", href: "/dashboard/customer/history?filter=pending" },
            { label: "Giao thất bại", value: loading ? '...' : String(stats.failed), color: "bg-red-500/10 text-red-400", href: "/dashboard/customer/history?filter=failed" },
            { label: "Tổng chi tiêu", value: loading ? '...' : formatCompact(stats.spend), color: "bg-primary/10 text-primary", href: "/dashboard/customer/history?filter=spend" },
          ].map((stat, index) => (
            <Link key={index} href={stat.href} className="block">
              <div className={`${stat.color} rounded-lg p-6 border border-default hover:border-primary transition-colors`}>
                <p className="text-secondary text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/customer/create-order">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <Plus className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tạo đơn hàng</h3>
              <p className="text-secondary mb-4">Tạo đơn hàng mới để gửi hàng đi</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Tạo ngay</Button>
            </div>
          </Link>

          <Link href="/dashboard/customer/tracking">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <Search className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Theo dõi đơn hàng</h3>
              <p className="text-secondary mb-4">Tìm kiếm và theo dõi đơn hàng của bạn</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Theo dõi</Button>
            </div>
          </Link>

          <Link href="/dashboard/customer/history">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <Clock className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lịch sử mua hàng</h3>
              <p className="text-secondary mb-4">Xem tất cả các đơn hàng trước đây</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem lịch sử</Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
