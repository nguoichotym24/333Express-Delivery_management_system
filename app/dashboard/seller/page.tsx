"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SellerDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển bán hàng</h1>
          <p className="text-secondary">Quản lý đơn hàng và doanh thu của bạn</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Đơn hàng hôm nay", value: "5", color: "bg-blue-500/10 text-blue-400" },
            { label: "Đang xử lý", value: "8", color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Hoàn thành", value: "42", color: "bg-green-500/10 text-green-400" },
            { label: "Doanh thu tháng", value: "125.5M", color: "bg-primary/10 text-primary" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/seller/create-order">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Tạo đơn hàng</h3>
              <p className="text-secondary mb-4 text-sm">Tạo đơn hàng mới cho khách hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Tạo ngay</Button>
            </div>
          </Link>

          <Link href="/dashboard/seller/orders">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Danh sách đơn hàng</h3>
              <p className="text-secondary mb-4 text-sm">Xem và quản lý tất cả đơn hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Xem danh sách</Button>
            </div>
          </Link>

          <Link href="/dashboard/seller/analytics">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Thống kê doanh thu</h3>
              <p className="text-secondary mb-4 text-sm">Xem biểu đồ doanh thu chi tiết</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">Xem thống kê</Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
