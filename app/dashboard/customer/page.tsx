"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CustomerDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển Khách hàng</h1>
          <p className="text-secondary">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Đơn hàng hoàn thành", value: "12", color: "bg-green-500/10 text-green-400" },
            { label: "Đang giao", value: "2", color: "bg-blue-500/10 text-blue-400" },
            { label: "Chờ xử lý", value: "1", color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Tổng chi tiêu", value: "25.5M", color: "bg-primary/10 text-primary" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
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
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Theo dõi đơn hàng</h3>
              <p className="text-secondary mb-4">Tìm kiếm và theo dõi đơn hàng của bạn</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Theo dõi</Button>
            </div>
          </Link>

          <Link href="/dashboard/customer/history">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
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