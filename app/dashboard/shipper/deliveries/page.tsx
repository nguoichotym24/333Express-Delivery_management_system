"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"

export default function DeliveriesPage() {
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-blue-500/10 text-blue-400",
      picked_up: "bg-purple-500/10 text-purple-400",
      in_transit: "bg-cyan-500/10 text-cyan-400",
      delivered: "bg-green-500/10 text-green-400",
      failed: "bg-red-500/10 text-red-400",
    }
    return colors[status] || "bg-gray-500/10 text-gray-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chờ lấy hàng",
      picked_up: "Đã lấy hàng",
      in_transit: "Đang giao",
      delivered: "Đã giao",
      failed: "Giao thất bại",
    }
    return labels[status] || status
  }

  const deliveries = [
    {
      id: "1",
      trackingNumber: "DH001234567890",
      customer: "Nguyễn Văn A",
      address: "123 Đường Lê Lợi, TP.HCM",
      status: "in_transit",
      amount: 25050000,
    },
    {
      id: "2",
      trackingNumber: "DH001234567891",
      customer: "Trần Thị B",
      address: "456 Đường Nguyễn Huệ, TP.HCM",
      status: "pending",
      amount: 15000000,
    },
    {
      id: "3",
      trackingNumber: "DH001234567892",
      customer: "Lê Văn C",
      address: "789 Đường Võ Văn Kiệt, TP.HCM",
      status: "delivered",
      amount: 8500000,
    },
  ]

  const filteredDeliveries = filterStatus === "all" ? deliveries : deliveries.filter((d) => d.status === filterStatus)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Danh sách giao hàng</h1>
          <p className="text-secondary">Xem danh sách đơn hàng được giao cho bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-default rounded-xl p-6">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "picked_up", "in_transit", "delivered", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-primary text-background"
                    : "bg-background border border-default text-foreground hover:border-primary"
                }`}
              >
                {status === "all" ? "Tất cả" : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-surface border border-default rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="grid md:grid-cols-5 gap-4 items-center">
                <div>
                  <p className="text-sm text-secondary mb-1">Mã vận đơn</p>
                  <p className="font-semibold text-primary">{delivery.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Khách hàng</p>
                  <p className="font-medium">{delivery.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Địa chỉ</p>
                  <p className="font-medium text-sm">{delivery.address}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(delivery.status)}`}
                  >
                    {getStatusLabel(delivery.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary mb-1">Giá trị</p>
                  <p className="font-bold text-primary">{(delivery.amount / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
