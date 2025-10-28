"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function StatusPage() {
  const [selectedOrder, setSelectedOrder] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const orders = [
    { id: "1", trackingNumber: "DH001234567890", customer: "Nguyễn Văn A" },
    { id: "2", trackingNumber: "DH001234567891", customer: "Trần Thị B" },
    { id: "3", trackingNumber: "DH001234567892", customer: "Lê Văn C" },
  ]

  const statuses = [
    { value: "picking_up", label: "Đang lấy hàng" },
    { value: "picked_up", label: "Đã lấy hàng" },
    { value: "in_transit", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "failed", label: "Giao thất bại" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Cập nhật trạng thái thành công!\nĐơn hàng: ${selectedOrder}\nTrạng thái: ${status}`)
    setSelectedOrder("")
    setStatus("")
    setNotes("")
    setImage(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Cập nhật trạng thái giao hàng</h1>
          <p className="text-secondary">Cập nhật trạng thái và tải ảnh/video xác nhận</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Selection */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Chọn đơn hàng</h3>
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order.trackingNumber)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedOrder === order.trackingNumber
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-default hover:border-primary"
                    }`}
                  >
                    <p className="font-medium text-primary">{order.trackingNumber}</p>
                    <p className="text-secondary text-sm">{order.customer}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Chọn trạng thái</h3>
              <div className="space-y-3">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      status === s.value
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-default hover:border-primary"
                    }`}
                  >
                    <p className="font-medium">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Ghi chú</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về giao hàng"
                rows={4}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Image Upload */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Tải ảnh/video xác nhận</h3>
              <div className="border-2 border-dashed border-default rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="font-medium mb-1">Tải ảnh hoặc video</p>
                  <p className="text-secondary text-sm">Nhấp để chọn hoặc kéo thả</p>
                  {image && <p className="text-primary text-sm mt-2">{image.name}</p>}
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
            <h3 className="font-semibold mb-6">Tóm tắt</h3>
            <div className="space-y-4 mb-6 pb-6 border-b border-default">
              <div>
                <p className="text-secondary text-sm mb-1">Đơn hàng</p>
                <p className="font-medium text-primary">{selectedOrder || "Chưa chọn"}</p>
              </div>
              <div>
                <p className="text-secondary text-sm mb-1">Trạng thái</p>
                <p className="font-medium">{statuses.find((s) => s.value === status)?.label || "Chưa chọn"}</p>
              </div>
              <div>
                <p className="text-secondary text-sm mb-1">Ảnh/Video</p>
                <p className="font-medium">{image ? "Đã chọn" : "Chưa chọn"}</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!selectedOrder || !status}
              className="w-full bg-primary text-background hover:bg-[#00A8CC]"
            >
              Cập nhật trạng thái
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
