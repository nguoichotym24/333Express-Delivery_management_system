"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type DayAgg = { day: string; orders: number; revenue: number }

export default function AnalyticsPage() {
  const [byDay, setByDay] = useState<DayAgg[]>([])
  const [totals, setTotals] = useState<{ count: number }>({ count: 0 })
  const [revenue, setRevenue] = useState<{ revenue: number }>({ revenue: 0 })

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then((data) => {
      setTotals(data?.totals || { count: 0 })
      setRevenue(data?.revenue || { revenue: 0 })
      setByDay(Array.isArray(data?.byDay) ? data.byDay.reverse() : [])
    })
  }, [])

  const systemStats = useMemo(() => byDay.map(d => ({ month: d.day, orders: d.orders, revenue: d.revenue, commission: d.revenue * 0.25, deliveryRate: 98 })), [byDay])
  const totalOrders = totals.count || 0
  const totalRevenue = revenue.revenue || 0
  const totalCommission = totalRevenue * 0.25
  const avgDeliveryRate = '98.0'
  const revenueDistribution = [
    { name: 'Doanh thu giao hàng', value: totalRevenue * 0.7 },
    { name: 'Hoa hồng hệ thống', value: totalCommission },
    { name: 'Khác', value: Math.max(totalRevenue * 0.3 - totalCommission, 0) },
  ]
  const COLORS = ["#dc2626", "#f97316", "#eab308"]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê hệ thống</h1>
          <p className="text-secondary">Phân tích doanh thu và hiệu suất toàn hệ thống</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng đơn hàng', value: totalOrders.toLocaleString(), color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Tổng doanh thu', value: `${(totalRevenue / 1_000_000_000).toFixed(1)}B`, color: 'bg-primary/10 text-primary' },
            { label: 'Tổng hoa hồng', value: `${(totalCommission / 1_000_000_000).toFixed(1)}B`, color: 'bg-yellow-500/10 text-yellow-400' },
            { label: 'Tỷ lệ hoàn thành', value: `${avgDeliveryRate}%`, color: 'bg-green-500/10 text-green-400' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-lg p-6 border border-default`}>
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Doanh thu theo ngày</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1f26', border: '1px solid #333' }} formatter={(value) => `${(Number(value) / 1_000_000).toFixed(0)}M`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Số đơn theo ngày</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1f26', border: '1px solid #333' }} />
                <Legend />
                <Bar dataKey="orders" fill="#dc2626" name="Số đơn" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Phân bố doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={revenueDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${(Number(value) / 1_000_000).toFixed(0)}M`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                </Pie>
                <Tooltip formatter={(value) => `${(Number(value) / 1_000_000).toFixed(0)}M`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Hoa hồng vs Doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1f26', border: '1px solid #333' }} formatter={(value) => `${(Number(value) / 1_000_000).toFixed(0)}M`} />
                <Legend />
                <Bar dataKey="revenue" fill="#dc2626" name="Doanh thu" />
                <Bar dataKey="commission" fill="#f97316" name="Hoa hồng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

