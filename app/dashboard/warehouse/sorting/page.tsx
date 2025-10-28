"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import orders from "@/data/orders.json"

export default function SortingPage() {
  const sortingData = [
    { status: "picked_up", label: "Đã lấy hàng", count: 24, color: "bg-purple-500/10 text-purple-400" },
    { status: "at_warehouse", label: "Đang đến kho đích", count: 18, color: "bg-yellow-500/10 text-yellow-400" },
    { status: "in_transit", label: "Chờ giao", count: 12, color: "bg-blue-500/10 text-blue-400" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Phân loại hàng</h1>
          <p className="text-secondary">Hiển thị danh sách hàng theo trạng thái</p>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          {sortingData.map((item, index) => (
            <div key={index} className={`${item.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{item.label}</p>
              <p className="text-3xl font-bold">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Sorting Details */}
        <div className="space-y-6">
          {sortingData.map((category, index) => (
            <div key={index} className="bg-surface border border-default rounded-xl overflow-hidden">
              <div className="p-6 border-b border-default bg-background">
                <h3 className="font-semibold">{category.label}</h3>
              </div>
              <div className="divide-y divide-default">
                {orders.orders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="p-6 hover:bg-background transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-primary">{order.trackingNumber}</p>
                        <p className="text-secondary text-sm">{order.receiverInfo.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${category.color}`}>
                        {category.label}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-secondary">Địa chỉ giao</p>
                        <p className="font-medium">{order.receiverInfo.address}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Số sản phẩm</p>
                        <p className="font-medium">{order.items.length} sản phẩm</p>
                      </div>
                      <div>
                        <p className="text-secondary">Giá trị</p>
                        <p className="font-medium text-primary">{order.totalAmount.toLocaleString("vi-VN")} đ</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
