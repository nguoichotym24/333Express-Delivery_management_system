"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import users from "@/data/users.json"

export default function UsersPage() {
  const [filterRole, setFilterRole] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "customer",
    phone: "",
  })

  const filteredUsers = filterRole === "all" ? users.users : users.users.filter((u: any) => u.role === filterRole)

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      alert(`Người dùng ${newUser.name} đã được thêm thành công`)
      setNewUser({ name: "", email: "", role: "customer", phone: "" })
      setShowAddForm(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      customer: "Khách hàng",
      warehouse: "Kho vận chuyển",
      shipper: "Shipper",
      admin: "Quản trị viên",
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      customer: "bg-blue-500/10 text-blue-400",
      warehouse: "bg-yellow-500/10 text-yellow-400",
      shipper: "bg-cyan-500/10 text-cyan-400",
      admin: "bg-red-500/10 text-red-400",
    }
    return colors[role] || "bg-gray-500/10 text-gray-400"
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
            <p className="text-secondary">Thêm, xóa, phân quyền người dùng</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-background hover:bg-[#00A8CC]"
          >
            {showAddForm ? "Hủy" : "Thêm người dùng"}
          </Button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Thêm người dùng mới</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Tên"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="customer">Khách hàng</option>
                <option value="warehouse">Kho vận chuyển</option>
                <option value="shipper">Shipper</option>
              </select>
            </div>
            <Button onClick={handleAddUser} className="bg-primary text-background hover:bg-[#00A8CC]">
              Thêm người dùng
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface border border-default rounded-xl p-6">
          <div className="flex flex-wrap gap-2">
            {["all", "customer", "warehouse", "shipper", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === role
                    ? "bg-primary text-background"
                    : "bg-background border border-default text-foreground hover:border-primary"
                }`}
              >
                {role === "all" ? "Tất cả" : getRoleLabel(role)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Số điện thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-default hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getRoleColor(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-red-400 hover:text-red-300 text-xs">Xóa</button>
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
