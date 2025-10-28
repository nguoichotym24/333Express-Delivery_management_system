"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import shippers from "@/data/shippers.json"

export default function ShipperDashboard() {
  const shipper = shippers.shippers[0]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Shipper Dashboard</h1>
          <p className="text-secondary">Quản lý giao hàng và doanh thu của bạn</p>
        </div>

        {/* Shipper Info */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <p className="text-secondary text-sm mb-2">Tên</p>
              <p className="text-2xl font-bold">{shipper.name}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Phương tiện</p>
              <p className="font-medium">{shipper.vehicleType}</p>
              <p className="text-secondary text-sm">{shipper.vehicleNumber}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Đánh giá</p>
              <p className="text-2xl font-bold text-primary">{shipper.rating}/5</p>
              <p className="text-secondary text-sm">{shipper.successRate}% thành công</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Trạng thái</p>
              <div className="inline-block px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium">
                {shipper.status === "available" ? "Sẵn sàng" : "Bận"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Giao hôm nay", value: "5", color: "bg-blue-500/10 text-blue-400" },
            { label: "Đang giao", value: "2", color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Hoàn thành", value: "245", color: "bg-green-500/10 text-green-400" },
            { label: "Doanh thu tháng", value: "2.5M", color: "bg-primary/10 text-primary" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/shipper/deliveries">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Danh sách giao hàng</h3>
              <p className="text-secondary mb-4 text-sm">Xem danh sách đơn hàng được giao cho bạn</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem danh sách</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/status">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Cập nhật trạng thái</h3>
              <p className="text-secondary mb-4 text-sm">Cập nhật trạng thái giao hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Cập nhật</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/earnings">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Thống kê doanh thu</h3>
              <p className="text-secondary mb-4 text-sm">Xem doanh thu và hoa hồng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Xem thống kê</Button>
            </div>
          </Link>

          <Link href="/dashboard/shipper/history">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
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
