"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AnalyticsPage() {
  const revenueData = [
    { month: "Tháng 1", revenue: 15000000, orders: 45 },
    { month: "Tháng 2", revenue: 18000000, orders: 52 },
    { month: "Tháng 3", revenue: 22000000, orders: 61 },
    { month: "Tháng 4", revenue: 19000000, orders: 55 },
    { month: "Tháng 5", revenue: 25000000, orders: 68 },
    { month: "Tháng 6", revenue: 28000000, orders: 75 },
  ]

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê doanh thu</h1>
          <p className="text-secondary">Phân tích doanh thu và hiệu suất bán hàng</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Tổng doanh thu", value: "147M", color: "bg-primary/10 text-primary" },
            { label: "Tổng đơn hàng", value: "356", color: "bg-blue-500/10 text-blue-400" },
            { label: "Trung bình/đơn", value: "412K", color: "bg-green-500/10 text-green-400" },
            { label: "Tỷ lệ hoàn thành", value: "98.5%", color: "bg-purple-500/10 text-purple-400" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Doanh thu theo tháng</h3>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{data.month}</span>
                    <span className="text-sm text-primary font-semibold">{(data.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Số đơn hàng theo tháng</h3>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{data.month}</span>
                    <span className="text-sm text-primary font-semibold">{data.orders} đơn</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(data.orders / 75) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h3 className="font-semibold mb-6">Sản phẩm bán chạy nhất</h3>
          <div className="space-y-4">
            {[
              { name: "Laptop Dell XPS 13", sales: 45, revenue: "1.125B" },
              { name: "iPhone 15 Pro", sales: 38, revenue: "950M" },
              { name: "Samsung Galaxy S24", sales: 32, revenue: "800M" },
              { name: "iPad Air", sales: 28, revenue: "700M" },
              { name: "AirPods Pro", sales: 156, revenue: "468M" },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-default last:border-0">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-secondary text-sm">{product.sales} bán</p>
                </div>
                <p className="text-primary font-semibold">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
