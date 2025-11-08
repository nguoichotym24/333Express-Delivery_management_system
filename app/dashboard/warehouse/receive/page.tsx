"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { statusLabel } from "@/lib/status"

type PublicOrder = { order_id: number; tracking_code: string; current_status: string; created_at: string }

const terminalStatuses = new Set(["delivered", "cancelled", "lost"])

export default function ReceivePage() {
  const { user } = useAuth()
  const warehouseId = user?.warehouse_id ?? null
  const [trackingNumber, setTrackingNumber] = useState("")
  const [scanned, setScanned] = useState<PublicOrder[]>([])
  const [info, setInfo] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState("")
  const [onlyEligible, setOnlyEligible] = useState(true)

  const chainFor = (status: string): string[] => {
    if (status === "created") return ["waiting_for_pickup", "picked_up", "arrived_at_origin_hub"]
    if (status === "waiting_for_pickup") return ["picked_up", "arrived_at_origin_hub"]
    if (status === "picked_up") return ["arrived_at_origin_hub"]
    return []
  }

  const isEligible = (o: PublicOrder) => !terminalStatuses.has(o.current_status) && chainFor(o.current_status).length > 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scanned.filter((o) => {
      if (onlyEligible && !isEligible(o)) return false
      if (!q) return true
      return o.tracking_code.toLowerCase().includes(q)
    })
  }, [scanned, query, onlyEligible])

  const handleScan = async () => {
    setError("")
    const code = trackingNumber.trim()
    if (!code) return
    setTrackingNumber("")
    try {
      const res = await fetch(`/api/orders/public/track/${encodeURIComponent(code)}`)
      if (!res.ok) {
        const msg = "Không tìm thấy đơn: " + code
        toast({ title: "Không tìm thấy", description: msg })
        setError(msg)
        return
      }
      const data = await res.json()
      const item: PublicOrder = {
        order_id: data.order_id,
        tracking_code: data.tracking_code,
        current_status: data.current_status,
        created_at: data.created_at,
      }
      if (!isEligible(item)) {
        const msg = "Đơn không hợp lệ để check-in hoặc đã vào kho"
        toast({ title: "Không hợp lệ", description: msg })
        setError(msg)
        return
      }
      setScanned((prev) => (prev.find((x) => x.order_id === item.order_id) ? prev : [item, ...prev]))
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi tra cứu đơn" })
      setError("Lỗi khi tra cứu đơn")
    }
  }

  const handleConfirm = async () => {
    setError("")
    setInfo("")
    if (!warehouseId) {
      const msg = "Tài khoản kho chưa gắn warehouse_id"
      toast({ title: "Thiếu thông tin", description: msg })
      setError(msg)
      return
    }
    const candidates = scanned.filter(isEligible)
    if (!candidates.length) return
    setBusy(true)
    try {
      for (const o of candidates) {
        const chain = chainFor(o.current_status)
        for (const status of chain) {
          const res = await fetch(`/api/orders/${o.order_id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, warehouse_id: warehouseId }),
          })
          if (!res.ok) {
            const d = await res.json().catch(() => ({}))
            throw new Error(d?.error || `Không thể cập nhật ${status}`)
          }
        }
      }
      const msg = `Đã nhận ${candidates.length} đơn vào kho`
      toast({ title: "Thành công", description: msg })
      setInfo(msg)
      setScanned([])
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message || "Có lỗi xảy ra" })
      setError(e.message || "Có lỗi xảy ra")
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Check-in theo mã</h1>
          <p className="text-secondary">Quét hoặc nhập mã vận đơn để nhận hàng vào kho gửi</p>
        </div>

        {!warehouseId && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-700">
            Tài khoản kho của bạn chưa gắn kho (warehouse_id). Vui lòng liên hệ admin.
          </div>
        )}

        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="flex gap-4 items-center">
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
            {info && <span className="text-sm text-green-500">{info}</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lọc theo mã vận đơn"
                className="bg-background border border-default rounded-lg px-3 py-2 text-sm flex-1"
              />
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} />
                Chỉ hiển thị đơn hợp lệ
              </label>
            </div>
            <div className="bg-surface border border-default rounded-xl overflow-hidden">
              <div className="p-6 border-b border-default">
                <h3 className="font-semibold">Đã quét ({filtered.length})</h3>
              </div>
              <div className="divide-y divide-default">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-secondary">Chưa có đơn hàng nào</div>
                ) : (
                  filtered.map((o) => (
                    <div key={o.order_id} className="p-6 hover:bg-background transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary">{o.tracking_code}</p>
                        <p className="text-secondary text-sm">Trạng thái hiện tại: {statusLabel(o.current_status)}</p>
                      </div>
                      <button onClick={() => setScanned((prev) => prev.filter((x) => x.order_id !== o.order_id))} className="text-red-400 hover:text-red-300 text-sm">Xóa</button>
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
                <span className="text-secondary">Tổng đơn quét</span>
                <span className="font-bold text-primary text-lg">{scanned.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Hợp lệ để nhận</span>
                <span className="font-bold">{scanned.filter(isEligible).length}</span>
              </div>
            </div>
            <Button onClick={handleConfirm} disabled={!warehouseId || scanned.filter(isEligible).length === 0 || busy} className="w-full bg-primary text-background hover:bg-[#00A8CC]">{busy ? "Đang cập nhật..." : "Xác nhận nhận hàng"}</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

