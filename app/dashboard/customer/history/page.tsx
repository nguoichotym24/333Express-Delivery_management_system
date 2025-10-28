"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import orders from "@/data/orders.json"

export default function HistoryPage() {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      order_created: "bg-blue-500/10 text-blue-400",
      picked_up: "bg-purple-500/10 text-purple-400",
      at_warehouse: "bg-yellow-500/10 text-yellow-400",
      in_transit: "bg-cyan-500/10 text-cyan-400",
      delivered: "bg-green-500/10 text-green-400",
    }
    return colors[status] || "bg-gray-500/10 text-gray-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      order_created: "Đơn hàng được tạo",
      picked_up: "Hàng được lấy",
      at_warehouse: "Tại kho",
      in_transit: "Đang giao",
      delivered: "Đã giao",
    }
    return labels[status] || status
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử mua hàng</h1>
          <p className="text-secondary">Xem tất cả các đơn hàng trước đây của bạn</p>
        </div>

        {/* Orders Table */}
        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Người gửi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {orders.orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm">{order.senderInfo.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {(order.totalAmount + order.shippingFee).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
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
