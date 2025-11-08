"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function EarningsPage() {
  const earningsData = [
    { month: "Tháng 1", deliveries: 45, revenue: 1125000, commission: 843750, net: 281250 },
    { month: "Tháng 2", deliveries: 52, revenue: 1300000, commission: 975000, net: 325000 },
    { month: "Tháng 3", deliveries: 61, revenue: 1525000, commission: 1143750, net: 381250 },
    { month: "Tháng 4", deliveries: 55, revenue: 1375000, commission: 1031250, net: 343750 },
    { month: "Tháng 5", deliveries: 68, revenue: 1700000, commission: 1275000, net: 425000 },
    { month: "Tháng 6", deliveries: 75, revenue: 1875000, commission: 1406250, net: 468750 },
  ]

  const totalDeliveries = earningsData.reduce((sum, d) => sum + d.deliveries, 0)
  const totalRevenue = earningsData.reduce((sum, d) => sum + d.revenue, 0)
  const totalCommission = earningsData.reduce((sum, d) => sum + d.commission, 0)
  const totalNet = earningsData.reduce((sum, d) => sum + d.net, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê doanh thu</h1>
          <p className="text-secondary">Xem doanh thu và hoa hồng của bạn</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Tổng giao hàng", value: totalDeliveries.toString(), color: "bg-blue-500/10 text-blue-400" },
            { label: "Tổng doanh thu", value: `${(totalRevenue / 1000000).toFixed(1)}M`, color: "bg-primary/10 text-primary" },
            { label: "Hoa hồng hệ thống (25%)", value: `${(totalCommission / 1000000).toFixed(1)}M`, color: "bg-yellow-500/10 text-yellow-400" },
            { label: "Doanh thu ròng (75%)", value: `${(totalNet / 1000000).toFixed(1)}M`, color: "bg-green-500/10 text-green-400" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tháng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Số giao hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Doanh thu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hoa hồng (25%)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Doanh thu ròng (75%)</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.map((data, index) => (
                  <tr key={index} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{data.month}</td>
                    <td className="px-6 py-4 text-sm">{data.deliveries}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">{(data.revenue / 1000000).toFixed(2)}M</td>
                    <td className="px-6 py-4 text-sm font-medium text-yellow-400">{(data.commission / 1000000).toFixed(2)}M</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-400">{(data.net / 1000000).toFixed(2)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}