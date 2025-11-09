"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, CheckCircle, BarChart3, Clock } from "lucide-react"

type OrderRow = { order_id: number; current_status: string }

export default function ShipperDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])

  // Role guard: only shipper
  useEffect(() => {
    if (!loading && user && user.role !== 'shipper') {
      router.replace(`/dashboard/${user.role}`)
    }
  }, [user, loading, router])

  useEffect(() => {
    fetch('/api/orders/shipper')
      .then(r => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
  }, [])

  const stats = useMemo(() => {
    const failedSet = new Set(['delivery_failed'])
    let total = orders.length
    let delivered = 0
    let failed = 0
    for (const o of orders) {
      if (o.current_status === 'delivered') delivered++
      else if (failedSet.has(o.current_status)) failed++
    }
    const delivering = Math.max(0, total - delivered - failed)
    return { total, delivering, delivered, failed }
  }, [orders])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển Shipper</h1>
          <p className="text-secondary">Quản lý giao hàng và thu nhập của bạn</p>
        </div>

        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-secondary text-sm mb-2">Tên</p>
              <p className="text-2xl font-bold">{user?.name || '-'}</p>
              <p className="text-sm text-secondary">{user?.email}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Điện thoại</p>
              <p className="font-medium">{user?.phone || '-'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Tổng quan</p>
              <p className="text-sm">Đã giao: <span className="font-semibold text-green-500">{stats.delivered}</span></p>
              <p className="text-sm">Đang giao: <span className="font-semibold text-blue-500">{stats.delivering}</span></p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/shipper/deliveries">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center"><Package className="w-6 h-6 text-background" /></div>
              <h3 className="text-xl font-semibold mb-2">Danh sách giao hàng</h3>
              <p className="text-secondary mb-4 text-sm">Xem các đơn được giao cho bạn</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem danh sách</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/status">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-background" /></div>
              <h3 className="text-xl font-semibold mb-2">Cập nhật trạng thái</h3>
              <p className="text-secondary mb-4 text-sm">Cập nhật trạng thái giao hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Cập nhật</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/earnings">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-background" /></div>
              <h3 className="text-xl font-semibold mb-2">Thống kê thu nhập</h3>
              <p className="text-secondary mb-4 text-sm">Xem thu nhập và hoa hồng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem thu nhập</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/history">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center"><Clock className="w-6 h-6 text-background" /></div>
              <h3 className="text-xl font-semibold mb-2">Lịch sử giao hàng</h3>
              <p className="text-secondary mb-4 text-sm">Xem lịch sử giao hàng cá nhân</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem lịch sử</Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
