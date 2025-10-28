"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function HistoryPage() {
  const deliveryHistory = [
    {
      id: "1",
      trackingNumber: "DH001234567890",
      customer: "Nguyễn Văn A",
      address: "123 Đường Lê Lợi, TP.HCM",
      status: "delivered",
      amount: 25050000,
      date: "2025-10-19",
    },
    {
      id: "2",
      trackingNumber: "DH001234567891",
      customer: "Trần Thị B",
      address: "456 Đường Nguyễn Huệ, TP.HCM",
      status: "delivered",
      amount: 15000000,
      date: "2025-10-18",
    },
    {
      id: "3",
      trackingNumber: "DH001234567892",
      customer: "Lê Văn C",
      address: "789 Đường Võ Văn Kiệt, TP.HCM",
      status: "delivered",
      amount: 8500000,
      date: "2025-10-17",
    },
    {
      id: "4",
      trackingNumber: "DH001234567893",
      customer: "Phạm Văn D",
      address: "321 Đường Cách Mạng Tháng 8, TP.HCM",
      status: "failed",
      amount: 12000000,
      date: "2025-10-16",
    },
    {
      id: "5",
      trackingNumber: "DH001234567894",
      customer: "Hoàng Thị E",
      address: "654 Đường Trần Hưng Đạo, TP.HCM",
      status: "delivered",
      amount: 18500000,
      date: "2025-10-15",
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: "bg-green-500/10 text-green-400",
      failed: "bg-red-500/10 text-red-400",
    }
    return colors[status] || "bg-gray-500/10 text-gray-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: "Đã giao",
      failed: "Giao thất bại",
    }
    return labels[status] || status
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử giao hàng</h1>
          <p className="text-secondary">Xem lịch sử giao hàng cá nhân của bạn</p>
        </div>

        {/* History Table */}
        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã vận đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Giá trị</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày giao</th>
                </tr>
              </thead>
              <tbody>
                {deliveryHistory.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{delivery.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm">{delivery.customer}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{delivery.address}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(delivery.status)}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">
                      {(delivery.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {new Date(delivery.date).toLocaleDateString("vi-VN")}
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
