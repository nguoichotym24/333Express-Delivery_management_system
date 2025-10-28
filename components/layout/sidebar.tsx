"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = {
  customer: [
    { label: "Dashboard", href: "/dashboard/customer" },
    { label: "Theo dõi đơn hàng", href: "/dashboard/customer/tracking" },
    { label: "Lịch sử mua hàng", href: "/dashboard/customer/history" },
  ],
  seller: [
    { label: "Dashboard", href: "/dashboard/seller" },
    { label: "Tạo đơn hàng", href: "/dashboard/seller/create-order" },
    { label: "Danh sách đơn hàng", href: "/dashboard/seller/orders" },
    { label: "Thống kê doanh thu", href: "/dashboard/seller/analytics" },
  ],
  warehouse: [
    { label: "Dashboard", href: "/dashboard/warehouse" },
    { label: "Nhận hàng", href: "/dashboard/warehouse/receive" },
    { label: "Phân loại hàng", href: "/dashboard/warehouse/sorting" },
    { label: "Phân công Shipper", href: "/dashboard/warehouse/assign" },
    { label: "Theo dõi hàng", href: "/dashboard/warehouse/tracking" },
  ],
  shipper: [
    { label: "Dashboard", href: "/dashboard/shipper" },
    { label: "Danh sách giao hàng", href: "/dashboard/shipper/deliveries" },
    { label: "Cập nhật trạng thái", href: "/dashboard/shipper/status" },
    { label: "Thống kê doanh thu", href: "/dashboard/shipper/earnings" },
    { label: "Lịch sử giao hàng", href: "/dashboard/shipper/history" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Quản lý người dùng", href: "/dashboard/admin/users" },
    { label: "Thống kê hệ thống", href: "/dashboard/admin/analytics" },
    { label: "Cấu hình hệ thống", href: "/dashboard/admin/settings" },
  ],
}

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const items = menuItems[user.role as keyof typeof menuItems] || []

  return (
    <aside className="w-64 bg-surface border-r border-default h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-secondary mb-4">MENU</h2>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-background font-medium"
                  : "text-foreground hover:bg-surface-light",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
