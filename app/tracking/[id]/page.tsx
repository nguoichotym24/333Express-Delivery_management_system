"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Package, CheckCircle } from "lucide-react"
import { useParams } from "next/navigation"

export default function TrackingPage() {
  const params = useParams()
  const trackingId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching order data
    setTimeout(() => {
      setOrder({
        id: trackingId,
        status: "in_transit",
        recipientName: "Nguyễn Văn A",
        recipientPhone: "0901234567",
        pickupAddress: "123 Đường Lê Lợi, TP.HCM",
        deliveryAddress: "456 Đường Nguyễn Huệ, TP.HCM",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            status: "created",
            label: "Đơn hàng được tạo",
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completed: true,
          },
          {
            status: "confirmed",
            label: "Đơn hàng được xác nhận",
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
            completed: true,
          },
          {
            status: "picked_up",
            label: "Hàng được lấy",
            time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            completed: true,
          },
          {
            status: "in_transit",
            label: "Đang giao hàng",
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
            completed: true,
          },
          { status: "delivered", label: "Giao hàng thành công", time: null, completed: false },
        ],
      })
      setLoading(false)
    }, 500)
  }, [trackingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary mb-6">Không tìm thấy đơn hàng</p>
          <Link href="/">
            <Button className="bg-primary text-background hover:bg-[#00A8CC]">Quay lại trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    created: "Đã tạo",
    confirmed: "Đã xác nhận",
    picked_up: "Đã lấy hàng",
    in_transit: "Đang giao",
    delivered: "Đã giao",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-default">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-[#00A8CC] mb-6">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold mb-2">Tra cứu đơn hàng</h1>
          <p className="text-secondary">
            Mã đơn hàng: <span className="text-primary font-mono">{trackingId}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Order Info */}
          <div className="md:col-span-2">
            <div className="bg-surface border border-default rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-secondary text-sm">Người nhận</p>
                  <p className="font-semibold">{order.recipientName}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Số điện thoại</p>
                  <p className="font-semibold">{order.recipientPhone}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Địa chỉ lấy hàng</p>
                  <p className="font-semibold">{order.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Địa chỉ giao hàng</p>
                  <p className="font-semibold">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-surface border border-default rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Lịch sử đơn hàng</h2>
              <div className="space-y-6">
                {order.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed ? "bg-primary" : "bg-surface-light border-2 border-default"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle className="w-6 h-6 text-background" />
                        ) : (
                          <Package className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className={`w-1 h-12 ${event.completed ? "bg-primary" : "bg-default"}`}></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold">{event.label}</p>
                      {event.time && <p className="text-secondary text-sm">{event.time.toLocaleString("vi-VN")}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div>
            <div className="bg-surface border border-default rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">Trạng thái</h3>
              <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
                <p className="text-primary font-semibold text-center">{statusLabels[order.status]}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-secondary text-sm">Ngày tạo</p>
                  <p className="font-semibold">{order.createdAt.toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-secondary text-sm">Dự kiến giao</p>
                  <p className="font-semibold">{order.estimatedDelivery.toLocaleDateString("vi-VN")}</p>
                </div>
              </div>

              <Link href="/signup" className="w-full mt-6">
                <Button className="w-full bg-primary text-background hover:bg-[#00A8CC]">Đăng ký để quản lý</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
