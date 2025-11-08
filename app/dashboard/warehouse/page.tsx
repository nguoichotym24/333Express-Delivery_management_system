"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WarehouseDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Warehouse Dashboard</h1>
          <p className="text-secondary">Quản lý hàng hóa và phân công shipper</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/warehouse/receive">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Nhận hàng</h3>
              <p className="text-secondary mb-4 text-sm">Quét mã vận đơn để nhận hàng từ người gửi</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Nhận hàng</Button>
            </div>
          </Link>

          <Link href="/dashboard/warehouse/sorting">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Phân loại hàng</h3>
              <p className="text-secondary mb-4 text-sm">Phân loại theo khu vực giao hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Phân loại</Button>
            </div>
          </Link>

          <Link href="/dashboard/warehouse/assign">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Phân công Shipper</h3>
              <p className="text-secondary mb-4 text-sm">Gán đơn hàng cho shipper trong khu vực</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Phân công</Button>
            </div>
          </Link>

          <Link href="/dashboard/warehouse/tracking">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Theo dõi hàng</h3>
              <p className="text-secondary mb-4 text-sm">Theo dõi trạng thái hàng trong kho</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Theo dõi</Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

