"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
type DayAgg = { day: string; orders: number; revenue: number };

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [byDay, setByDay] = useState<DayAgg[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [ordersToday, setOrdersToday] = useState<number>(0);
  const [revenueToday, setRevenueToday] = useState<number>(0);
  useEffect(() => {
    // Users count (exact)
    fetch("/api/admin/users/count")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.count === "number") {
          setUsersCount(Number(data.count));
        } else {
          return fetch("/api/admin/users?limit=1&page=1")
            .then((r) => r.json())
            .then((d) => {
              if (typeof d?.total === "number") setUsersCount(Number(d.total));
              else if (Array.isArray(d)) setUsersCount(d.length);
              else setUsersCount(0);
            });
        }
      })
      .catch(() => setUsersCount(0));
    // Analytics
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => {
        setByDay(Array.isArray(data?.byDay) ? data.byDay : []);
        setTotalRevenue(Number(data?.revenue?.revenue || 0));
        setOrdersToday(Number(data?.totals?.orders_today || 0));
        setRevenueToday(Number(data?.revenue?.revenue_today || 0));
      })
      .catch(() => {
        setByDay([]);
        setTotalRevenue(0);
      });
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const todayAgg = useMemo(() => {
    const fromSeries = byDay.find((d) => d.day === today);
    return {
      day: today,
      orders: fromSeries?.orders ?? ordersToday,
      revenue: fromSeries?.revenue ?? revenueToday,
    };
  }, [byDay, today, ordersToday, revenueToday]);
  const cards = [
    {
      label: "Tổng người dùng",
      value: usersCount.toLocaleString(),
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Đơn hàng hôm nay",
      value: todayAgg.orders.toLocaleString(),
      color: "bg-yellow-500/10 text-yellow-400",
    },
    {
      label: "Doanh thu hôm nay",
      value: `${(todayAgg.revenue / 1_000_000).toFixed(1)}M`,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Tổng doanh thu",
      value: `${(totalRevenue / 1_000_000_000).toFixed(1)}B`,
      color: "bg-green-500/10 text-green-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển Admin</h1>
          <p className="text-secondary">Quản lý toàn bộ hệ thống</p>
        </div>

        {/* System Stats (live) */}
        <div className="grid md:grid-cols-4 gap-4">
          {cards.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-lg p-6 border border-default`}
            >
              <p className="text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/users">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Quản lý người dùng</h3>
              <p className="text-secondary mb-4 text-sm">
                Thêm, xóa, phân quyền người dùng
              </p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">
                Quản lý
              </Button>
            </div>
          </Link>

          <Link href="/dashboard/admin/analytics">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Thống kê hệ thống</h3>
              <p className="text-secondary mb-4 text-sm">
                Xem biểu đồ và thống kê toàn hệ thống
              </p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">
                Xem thống kê
              </Button>
            </div>
          </Link>

          <Link href="/dashboard/admin/settings">
            <div className="bg-surface border border-default rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Cấu hình hệ thống</h3>
              <p className="text-secondary mb-4 text-sm">
                Cấu hình phí, tuyến đường, v.v.
              </p>
              <Button className="bg-primary text-background hover:bg-[#00A8CC] w-full">
                Cấu hình
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
