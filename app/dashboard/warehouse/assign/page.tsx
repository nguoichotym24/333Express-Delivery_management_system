"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import shippers from "@/data/shippers.json"
import orders from "@/data/orders.json"

export default function AssignPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedShipper, setSelectedShipper] = useState("")

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleAssign = () => {
    if (selectedOrders.length > 0 && selectedShipper) {
      alert(`Đã phân công ${selectedOrders.length} đơn hàng cho shipper`)
      setSelectedOrders([])
      setSelectedShipper("")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Phân công Shipper</h1>
          <p className="text-secondary">Chọn đơn hàng và phân công cho shipper</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-default rounded-xl overflow-hidden">
              <div className="p-6 border-b border-default">
                <h3 className="font-semibold">Danh sách đơn hàng chờ giao</h3>
              </div>
              <div className="divide-y divide-default max-h-96 overflow-y-auto">
                {orders.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-background transition-colors cursor-pointer"
                    onClick={() => handleSelectOrder(order.id)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 rounded border-default cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-primary">{order.trackingNumber}</p>
                        <p className="text-secondary text-sm">{order.receiverInfo.name}</p>
                        <p className="text-secondary text-sm">{order.receiverInfo.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{order.totalAmount.toLocaleString("vi-VN")} đ</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipper Selection */}
          <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
            <h3 className="font-semibold mb-6">Chọn Shipper</h3>

            <div className="space-y-3 mb-6">
              {shippers.shippers.map((shipper: any) => (
                <button
                  key={shipper.id}
                  onClick={() => setSelectedShipper(shipper.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedShipper === shipper.id
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-default hover:border-primary"
                  }`}
                >
                  <p className="font-medium">{shipper.name}</p>
                  <p className="text-secondary text-sm">{shipper.vehicleNumber}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-secondary">Đánh giá: {shipper.rating}/5</span>
                    <span className="text-primary">{shipper.successRate}% thành công</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-6 pb-6 border-b border-default">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Đơn hàng chọn</span>
                <span className="font-bold text-primary">{selectedOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Tổng giá trị</span>
                <span className="font-bold">
                  {orders.orders
                    .filter((o: any) => selectedOrders.includes(o.id))
                    .reduce((sum, o: any) => sum + o.totalAmount, 0)
                    .toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
            </div>

            <Button
              onClick={handleAssign}
              disabled={selectedOrders.length === 0 || !selectedShipper}
              className="w-full bg-primary text-background hover:bg-[#00A8CC]"
            >
              Phân công
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
