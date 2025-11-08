"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ReceivePage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [scanned, setScanned] = useState<string[]>([])

  const handleScan = () => {
    if (!trackingNumber.trim()) return
    if (!scanned.includes(trackingNumber.trim())) {
      setScanned((prev) => [...prev, trackingNumber.trim()])
    }
    setTrackingNumber("")
  }

  const handleConfirm = () => {
    alert(`Đã nhận ${scanned.length} đơn hàng`)
    setScanned([])
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nhận hàng</h1>
          <p className="text-secondary">Quét mã vận đơn để nhận hàng từ người gửi</p>
        </div>

        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Quét hoặc nhập mã vận đơn"
              className="flex-1 bg-background border border-default rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button onClick={handleScan} className="bg-primary text-background hover:bg-[#00A8CC] px-8">Quét</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-surface border border-default rounded-xl overflow-hidden">
              <div className="p-6 border-b border-default">
                <h3 className="font-semibold">Đã quét ({scanned.length})</h3>
              </div>
              <div className="divide-y divide-default">
                {scanned.length === 0 ? (
                  <div className="p-8 text-center text-secondary">Chưa có đơn hàng nào</div>
                ) : (
                  scanned.map((code) => (
                    <div key={code} className="p-6 hover:bg-background transition-colors flex items-center justify-between">
                      <p className="font-semibold text-primary">{code}</p>
                      <button onClick={() => setScanned((prev) => prev.filter((c) => c !== code))} className="text-red-400 hover:text-red-300 text-sm">Xóa</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-xl p-8 h-fit sticky top-6">
            <h3 className="font-semibold mb-6">Tóm tắt</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary">Tổng đơn hàng</span>
                <span className="font-bold text-primary text-lg">{scanned.length}</span>
              </div>
            </div>
            <Button onClick={handleConfirm} disabled={scanned.length === 0} className="w-full bg-primary text-background hover:bg-[#00A8CC]">Xác nhận nhận hàng</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

