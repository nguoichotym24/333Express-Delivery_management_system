"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import warehouses from "@/data/warehouses.json"

export default function WarehouseDashboard() {
  const warehouse = warehouses.warehouses[0]
  const capacityPercent = (warehouse.currentLoad / warehouse.capacity) * 100

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Warehouse Dashboard</h1>
          <p className="text-secondary">Quản lý hàng hóa và phân công shipper</p>
        </div>

        {/* Warehouse Info */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-secondary text-sm mb-2">Tên kho</p>
              <p className="text-2xl font-bold">{warehouse.name}</p>
              <p className="text-secondary text-sm mt-2">{warehouse.code}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Địa chỉ</p>
              <p className="font-medium">{warehouse.address}</p>
            </div>
            <div>
              <p className="text-secondary text-sm mb-2">Số điện thoại</p>
              <p className="font-medium">{warehouse.phone}</p>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h3 className="font-semibold mb-6">Dung tích kho</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Đã sử dụng</span>
              <span className="font-semibold text-primary">
                {warehouse.currentLoad.toLocaleString()} / {warehouse.capacity.toLocaleString()} m³
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPercent > 80 ? "bg-red-500" : capacityPercent > 60 ? "bg-yellow-500" : "bg-primary"
                }`}
                style={{ width: `${capacityPercent}%` }}
              ></div>
            </div>
            <p className="text-secondary text-sm">{capacityPercent.toFixed(1)}% dung tích</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Hàng chờ xử lý", value: "24", color: "bg-blue-500/10 text-blue-400" },
            { label: "Đang xử lý", value: "18", color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Chờ giao", value: "12", color: "bg-purple-500/10 text-purple-400" },
            { label: "Đã giao", value: "156", color: "bg-green-500/10 text-green-400" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/warehouse/receive">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Nhận hàng</h3>
              <p className="text-secondary mb-4 text-sm">Quét mã vận đơn để nhận hàng từ seller</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Nhận hàng</Button>
            </div>
          </Link>

          <Link href="/dashboard/warehouse/sorting">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Phân loại hàng</h3>
              <p className="text-secondary mb-4 text-sm">Phân loại hàng theo khu vực giao hàng</p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC]">Phân loại</Button>
            </div>
          </Link>

          <Link href="/dashboard/warehouse/assign">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Phân công Shipper</h3>
              <p className="text-secondary mb-4 text-sm">Phân công đơn hàng cho shipper</p>
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
