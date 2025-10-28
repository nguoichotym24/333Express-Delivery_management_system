"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import orders from "@/data/orders.json"

export default function ReceivePage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [scannedOrders, setScannedOrders] = useState<any[]>([])

  const handleScan = () => {
    const order = orders.orders.find((o: any) => o.trackingNumber === trackingNumber)
    if (order && !scannedOrders.find((o) => o.id === order.id)) {
      setScannedOrders([...scannedOrders, { ...order, receivedAt: new Date().toISOString() }])
      setTrackingNumber("")
    }
  }

  const handleConfirm = () => {
    alert(`Đã nhận ${scannedOrders.length} đơn hàng`)
    setScannedOrders([])
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Nhận hàng</h1>
          <p className="text-secondary">Quét mã vận đơn để nhận hàng từ seller</p>
        </div>

        {/* Scan Section */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
              placeholder="Quét hoặc nhập mã vận đơn"
              className="flex-1 bg-background border border-default rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button onClick={handleScan} className="bg-primary text-background hover:bg-[#00A8CC] px-8">
              Quét
            </Button>
          </div>
        </div>

        {/* Scanned Orders */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-surface border border-default rounded-xl overflow-hidden">
              <div className="p-6 border-b border-default">
                <h3 className="font-semibold">Hàng đã quét ({scannedOrders.length})</h3>
              </div>
              <div className="divide-y divide-default">
                {scannedOrders.length === 0 ? (
                  <div className="p-8 text-center text-secondary">Chưa quét hàng nào</div>
                ) : (
                  scannedOrders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-background transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-primary">{order.trackingNumber}</p>
                          <p className="text-secondary text-sm">{order.senderInfo.name}</p>
                        </div>
                        <button
                          onClick={() => setScannedOrders(scannedOrders.filter((o) => o.id !== order.id))}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-secondary">Người gửi</p>
                          <p className="font-medium">{order.senderInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-secondary">Người nhận</p>
                          <p className="font-medium">{order.receiverInfo.name}</p>
                        </div>
                      </div>
                      <p className="text-secondary text-xs mt-3">
                        Quét lúc: {new Date(order.receivedAt).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
            <h3 className="font-semibold mb-6">Tóm tắt</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary">Tổng đơn hàng</span>
                <span className="font-bold text-primary text-lg">{scannedOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tổng sản phẩm</span>
                <span className="font-bold">{scannedOrders.reduce((sum, o) => sum + o.items.length, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tổng giá trị</span>
                <span className="font-bold text-primary">
                  {scannedOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={scannedOrders.length === 0}
              className="w-full bg-primary text-background hover:bg-[#00A8CC]"
            >
              Xác nhận nhận hàng
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
