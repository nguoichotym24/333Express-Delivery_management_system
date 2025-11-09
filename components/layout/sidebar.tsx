"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  History,
  QrCode,
  Boxes,
  UserCheck,
  PackageSearch,
  Package,
  CheckCircle,
  BarChart3,
  Clock,
  Users,
  Settings,
} from "lucide-react"

const menuItems = {
  customer: [
    { label: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "Theo dõi đơn hàng", href: "/dashboard/customer/tracking", icon: Search },
    { label: "Lịch sử mua hàng", href: "/dashboard/customer/history", icon: History },
  ],
  warehouse: [
    { label: "Dashboard", href: "/dashboard/warehouse", icon: LayoutDashboard },
    { label: "Nhận hàng", href: "/dashboard/warehouse/receive", icon: QrCode },
    { label: "Phân loại hàng", href: "/dashboard/warehouse/sorting", icon: Boxes },
    { label: "Phân công Shipper", href: "/dashboard/warehouse/assign", icon: UserCheck },
    { label: "Theo dõi hàng", href: "/dashboard/warehouse/tracking", icon: PackageSearch },
  ],
  shipper: [
    { label: "Dashboard", href: "/dashboard/shipper", icon: LayoutDashboard },
    { label: "Danh sách giao hàng", href: "/dashboard/shipper/deliveries", icon: Package },
    { label: "Cập nhật trạng thái", href: "/dashboard/shipper/status", icon: CheckCircle },
    { label: "Thống kê doanh thu", href: "/dashboard/shipper/earnings", icon: BarChart3 },
    { label: "Lịch sử giao hàng", href: "/dashboard/shipper/history", icon: Clock },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Quản lý người dùng", href: "/dashboard/admin/users", icon: Users },
    { label: "Thống kê hệ thống", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Cấu hình hệ thống", href: "/dashboard/admin/settings", icon: Settings },
  ],
} as const

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const items = menuItems[user.role as keyof typeof menuItems] || []

  return (
    <aside className="w-64 bg-surface border-r border-default h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-secondary mb-4">MENU</h2>
        <nav className="space-y-2 stagger-children">
          {items.map((item) => {
            const Icon = (item as any).icon as React.ComponentType<any> | undefined
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-lg text-sm transition-colors transition-transform duration-200 hover:translate-x-0.5",
                  "flex items-center gap-2",
                  active ? "bg-primary text-background font-medium" : "text-foreground hover:bg-surface-light",
                )}
              >
                {Icon ? <Icon className="w-4 h-4" /> : null}
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

