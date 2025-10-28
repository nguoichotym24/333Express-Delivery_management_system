"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-secondary">Quản lý toàn bộ hệ thống</p>
        </div>

        {/* System Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Tổng người dùng", value: "1,245", color: "bg-blue-500/10 text-blue-400" },
            { label: "Đơn hàng hôm nay", value: "156", color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Doanh thu hôm nay", value: "45.2M", color: "bg-primary/10 text-primary" },
            { label: "Tỷ lệ hoàn thành", value: "98.5%", color: "bg-green-500/10 text-green-400" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/users">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Quản lý người dùng</h3>
              <p className="text-secondary mb-4 text-sm">Thêm, xóa, phân quyền người dùng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Quản lý</Button>
            </div>
          </Link>

          <Link href="/dashboard/admin/analytics">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Thống kê hệ thống</h3>
              <p className="text-secondary mb-4 text-sm">Xem biểu đồ và thống kê toàn hệ thống</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Xem thống kê</Button>
            </div>
          </Link>

          <Link href="/dashboard/admin/settings">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Cấu hình hệ thống</h3>
              <p className="text-secondary mb-4 text-sm">Cấu hình phí, tuyến đường, v.v.</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Cấu hình</Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
