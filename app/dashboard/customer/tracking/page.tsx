"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import orders from "@/data/orders.json"

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const handleSearch = () => {
    const order = orders.orders.find((o: any) => o.trackingNumber === trackingNumber)
    setSelectedOrder(order || null)
  }

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
          <h1 className="text-3xl font-bold mb-2">Theo dõi đơn hàng</h1>
          <p className="text-secondary">Nhập mã vận đơn để theo dõi đơn hàng của bạn</p>
        </div>

        {/* Search Section */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Nhập mã vận đơn (VD: DH001234567890)"
              className="flex-1 bg-background border border-default rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSearch} className="bg-primary text-background hover:bg-[#00A8CC] px-8">
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder ? (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-secondary text-sm mb-2">Mã vận đơn</p>
                  <p className="text-2xl font-bold text-primary">{selectedOrder.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm mb-2">Trạng thái</p>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg font-medium ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </div>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Người gửi</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.senderInfo.name}</p>
                    <p className="text-secondary">{selectedOrder.senderInfo.address}</p>
                    <p className="text-secondary">{selectedOrder.senderInfo.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Người nhận</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.receiverInfo.name}</p>
                    <p className="text-secondary">{selectedOrder.receiverInfo.address}</p>
                    <p className="text-secondary">{selectedOrder.receiverInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Lịch sử cập nhật</h3>
              <div className="space-y-4">
                {selectedOrder.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      {index < selectedOrder.timeline.length - 1 && <div className="w-0.5 h-12 bg-default mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">{event.description}</p>
                      <p className="text-secondary text-sm">{new Date(event.timestamp).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Sản phẩm</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-default last:border-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg bg-background object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-secondary text-sm">Số lượng: {item.quantity}</p>
                      <p className="text-primary font-semibold">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary">Tổng tiền hàng</span>
                  <span className="font-medium">{selectedOrder.totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Phí vận chuyển</span>
                  <span className="font-medium">{selectedOrder.shippingFee.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="border-t border-default pt-3 flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-primary font-bold text-lg">
                    {(selectedOrder.totalAmount + selectedOrder.shippingFee).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : trackingNumber ? (
          <div className="bg-surface border border-default rounded-xl p-8 text-center">
            <p className="text-secondary">Không tìm thấy đơn hàng với mã vận đơn này</p>
          </div>
        ) : (
          <div className="bg-surface border border-default rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-secondary">Nhập mã vận đơn để bắt đầu theo dõi</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
