"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AnalyticsPage() {
  const systemStats = [
    { month: "Tháng 1", orders: 1245, revenue: 125000000, commission: 31250000, deliveryRate: 96.5 },
    { month: "Tháng 2", orders: 1456, revenue: 145000000, commission: 36250000, deliveryRate: 97.2 },
    { month: "Tháng 3", orders: 1678, revenue: 167000000, commission: 41750000, deliveryRate: 97.8 },
    { month: "Tháng 4", orders: 1523, revenue: 152000000, commission: 38000000, deliveryRate: 97.1 },
    { month: "Tháng 5", orders: 1834, revenue: 183000000, commission: 45750000, deliveryRate: 98.2 },
    { month: "Tháng 6", orders: 2015, revenue: 201000000, commission: 50250000, deliveryRate: 98.5 },
  ]

  const totalOrders = systemStats.reduce((sum, s) => sum + s.orders, 0)
  const totalRevenue = systemStats.reduce((sum, s) => sum + s.revenue, 0)
  const totalCommission = systemStats.reduce((sum, s) => sum + s.commission, 0)
  const avgDeliveryRate = (systemStats.reduce((sum, s) => sum + s.deliveryRate, 0) / systemStats.length).toFixed(1)

  const revenueDistribution = [
    { name: "Doanh thu giao hàng", value: totalRevenue * 0.7 },
    { name: "Hoa hồng hệ thống", value: totalCommission },
    { name: "Khác", value: totalRevenue * 0.3 - totalCommission },
  ]

  const COLORS = ["#dc2626", "#f97316", "#eab308"]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê hệ thống</h1>
          <p className="text-secondary">Phân tích doanh thu và hiệu suất toàn hệ thống</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Tổng đơn hàng", value: totalOrders.toLocaleString(), color: "bg-blue-500/10 text-blue-400" },
            {
              label: "Tổng doanh thu",
              value: `${(totalRevenue / 1000000000).toFixed(1)}B`,
              color: "bg-primary/10 text-primary",
            },
            {
              label: "Tổng hoa hồng",
              value: `${(totalCommission / 1000000000).toFixed(1)}B`,
              color: "bg-yellow-500/10 text-yellow-400",
            },
            {
              label: "Tỷ lệ hoàn thành",
              value: `${avgDeliveryRate}%`,
              color: "bg-green-500/10 text-green-400",
            },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Line Chart */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Doanh thu theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f26", border: "1px solid #333" }}
                  formatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626" }}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Bar Chart */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Số đơn hàng theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1f26", border: "1px solid #333" }} />
                <Legend />
                <Bar dataKey="orders" fill="#dc2626" name="Số đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Distribution Pie Chart */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Phân bổ doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(value / 1000000).toFixed(0)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Commission vs Revenue */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Hoa hồng vs Doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f26", border: "1px solid #333" }}
                  formatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#dc2626" name="Doanh thu" />
                <Bar dataKey="commission" fill="#f97316" name="Hoa hồng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tháng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Số đơn hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Doanh thu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hoa hồng (25%)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tỷ lệ hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {systemStats.map((data, index) => (
                  <tr key={index} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{data.month}</td>
                    <td className="px-6 py-4 text-sm">{data.orders.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">
                      {(data.revenue / 1000000).toFixed(0)}M
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-yellow-400">
                      {(data.commission / 1000000).toFixed(0)}M
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${data.deliveryRate}%` }}
                          ></div>
                        </div>
                        <span className="text-green-400 font-medium">{data.deliveryRate}%</span>
                      </div>
                    </td>
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
