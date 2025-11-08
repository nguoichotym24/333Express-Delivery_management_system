"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  warehouse_id?: number | null;
};

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filterRole, setFilterRole] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "customer",
    phone: "",
    password: "",
    warehouse_id: "" as string | number,
  });
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    name?: string;
    role?: string;
    phone?: string;
    address?: string;
    warehouse_id?: string | number;
    password?: string;
  }>({});
  const [warehouses, setWarehouses] = useState<
    Array<{ warehouse_id: number; code: string; name: string }>
  >([]);
  const whMap = useMemo(() => {
    const m = new Map<number, string>();
    warehouses.forEach((w) => m.set(w.warehouse_id, `${w.code} - ${w.name}`));
    return m;
  }, [warehouses]);

  const loadUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filterRole !== "all") params.set("role", filterRole);
    params.set("page", String(page));
    params.set("limit", String(limit));
    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // backward compatibility if server returns array
          setRows(data);
          setTotal(data.length);
        } else {
          setRows(Array.isArray(data?.data) ? data.data : []);
          setTotal(Number(data?.total || 0));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [q, filterRole, page, limit]);

  // Initialize state from URL once
  const initializedFromUrl = useRef(false);
  useEffect(() => {
    if (initializedFromUrl.current) return;
    const qp = searchParams;
    const q0 = qp.get("q") || "";
    const role0 = qp.get("role") || "all";
    const page0 = parseInt(qp.get("page") || "1", 10);
    const limit0 = parseInt(qp.get("limit") || "10", 10);
    setQ(q0);
    setFilterRole(role0);
    setPage(Number.isFinite(page0) && page0 > 0 ? page0 : 1);
    setLimit(Number.isFinite(limit0) && limit0 > 0 ? limit0 : 10);
    initializedFromUrl.current = true;
  }, []);

  // Reflect state to URL query
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filterRole !== "all") params.set("role", filterRole);
    if (page > 1) params.set("page", String(page));
    if (limit !== 10) params.set("limit", String(limit));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [q, filterRole, page, limit, pathname, router]);

  useEffect(() => {
    // fetch warehouses for dropdowns
    fetch("/api/warehouses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWarehouses(data);
      })
      .catch(() => {});
  }, []);

  const filteredUsers = rows;
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement | null>(null);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showFilterMenu) return;
      const t = e.target as Node;
      if (filterBtnRef.current?.contains(t)) return;
      if (filterMenuRef.current?.contains(t)) return;
      setShowFilterMenu(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [showFilterMenu]);

  const handleAddUser = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      };
      if (newUser.password) payload.password = newUser.password;
      if (newUser.warehouse_id !== "" && newUser.warehouse_id !== null)
        payload.warehouse_id = Number(newUser.warehouse_id);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Không thể tạo người dùng");
      } else {
        setShowAddForm(false);
        setNewUser({
          name: "",
          email: "",
          role: "customer",
          phone: "",
          password: "",
          warehouse_id: "",
        });
        loadUsers();
      }
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      customer: "Khách hàng",
      warehouse: "Kho vận chuyển",
      shipper: "Shipper",
      admin: "Quản trị viên",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      customer: "bg-blue-500/10 text-blue-400",
      warehouse: "bg-yellow-500/10 text-yellow-400",
      shipper: "bg-cyan-500/10 text-cyan-400",
      admin: "bg-red-500/10 text-red-400",
    };
    return colors[role] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
            <p className="text-secondary">Thêm, xóa, phân quyền người dùng</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-background hover:bg-[#00A8CC]"
          >
            {showAddForm ? "Đóng" : "Thêm người dùng"}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="font-semibold mb-6">Thêm người dùng mới</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Tên"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Mật khẩu (bỏ trống = password123)"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="customer">Khách hàng</option>
                <option value="warehouse">Kho vận chuyển</option>
                <option value="shipper">Shipper</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <select
                value={newUser.warehouse_id as any}
                onChange={(e) =>
                  setNewUser({ ...newUser, warehouse_id: e.target.value })
                }
                className="bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Không gán kho</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              disabled={saving}
              onClick={handleAddUser}
              className="bg-primary text-background hover:bg-[#00A8CC]"
            >
              {saving ? "Đang lưu..." : "Thêm người dùng"}
            </Button>
          </div>
        )}

        <div className="bg-surface border border-default rounded-xl p-6 relative">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Tìm theo tên/email/SĐT"
              className="bg-background border border-default rounded-lg px-4 py-2 text-sm flex-1 min-w-[220px]"
            />
            <div className="ml-auto relative">
              <button
                ref={filterBtnRef}
                onClick={() => setShowFilterMenu((v) => !v)}
                className="px-4 py-2 rounded-lg text-sm bg-background border border-default hover:border-primary flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 text-secondary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.5A1.5 1.5 0 014.5 3h15a1.5 1.5 0 011.2 2.4l-5.7 7.7a1.5 1.5 0 00-.3.9v5.1a1 1 0 01-1.4.9l-3-1.5a1 1 0 01-.6-.9v-3.6a1.5 1.5 0 00-.3-.9L3.3 5.4A1.5 1.5 0 013 4.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {" "}
                  {filterRole === "all" ? "Tất cả" : getRoleLabel(filterRole)}
                </span>
              </button>
              {showFilterMenu && (
                <div
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-surface border border-default rounded-lg shadow-lg z-10"
                >
                  {[
                    { key: "all", label: "Tất cả" },
                    { key: "customer", label: "Khách hàng" },
                    { key: "warehouse", label: "Kho vận chuyển" },
                    { key: "shipper", label: "Shipper" },
                    { key: "admin", label: "Quản trị viên" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setPage(1);
                        setFilterRole(opt.key);
                        setShowFilterMenu(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-background ${
                        filterRole === opt.key ? "text-primary" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Tên
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    SĐT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Kho
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredUsers.length === 0 && (
                  <tr key="empty">
                    <td
                      className="px-6 py-6 text-secondary text-sm"
                      colSpan={6}
                    >
                      Không có người dùng
                    </td>
                  </tr>
                )}
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-default hover:bg-background transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {editingId === user.id ? (
                        <input
                          className="bg-background border border-default rounded px-2 py-1"
                          defaultValue={user.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <select
                          defaultValue={user.role}
                          onChange={(e) =>
                            setEditData({ ...editData, role: e.target.value })
                          }
                          className="bg-background border border-default rounded px-2 py-1"
                        >
                          <option value="customer">Khách hàng</option>
                          <option value="warehouse">Kho vận chuyển</option>
                          <option value="shipper">Shipper</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <input
                          className="bg-background border border-default rounded px-2 py-1"
                          defaultValue={user.phone || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                        />
                      ) : (
                        user.phone || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <select
                          defaultValue={user.warehouse_id ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              warehouse_id: e.target.value,
                            })
                          }
                          className="bg-background border border-default rounded px-2 py-1"
                        >
                          <option value="">Không gán kho</option>
                          {warehouses.map((w) => (
                            <option key={w.warehouse_id} value={w.warehouse_id}>
                              {w.code} - {w.name}
                            </option>
                          ))}
                        </select>
                      ) : user.warehouse_id ? (
                        whMap.get(user.warehouse_id) || user.warehouse_id
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            className="px-3 py-1 rounded bg-primary text-background"
                            onClick={async () => {
                              const payload: any = { ...editData };
                              if (
                                payload.warehouse_id !== undefined &&
                                payload.warehouse_id !== null &&
                                payload.warehouse_id !== ""
                              )
                                payload.warehouse_id = Number(
                                  payload.warehouse_id
                                );
                              const res = await fetch(
                                `/api/admin/users/${user.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(payload),
                                }
                              );
                              if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                alert(err?.error || "Không thể cập nhật");
                              } else {
                                setEditingId(null);
                                setEditData({});
                                loadUsers();
                              }
                            }}
                          >
                            Lưu
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-background border border-default"
                            onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}
                          >
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 rounded bg-background border border-default"
                            onClick={() => {
                              setEditingId(user.id);
                              setEditData({});
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-600 text-white"
                            onClick={async () => {
                              if (!confirm("Xoá người dùng này?")) return;
                              const res = await fetch(
                                `/api/admin/users/${user.id}`,
                                { method: "DELETE" }
                              );
                              if (!res.ok && res.status !== 204) {
                                const err = await res.json().catch(() => ({}));
                                alert(err?.error || "Không thể xoá");
                              } else {
                                loadUsers();
                              }
                            }}
                          >
                            Xoá
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">
            Tổng: {total.toLocaleString()} người dùng
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
              className="bg-background border border-default rounded px-2 py-1 text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-background border border-default disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm">Trang {page}</span>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-background border border-default disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
