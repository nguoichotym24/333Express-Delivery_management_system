"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/lib/auth-context";

type OrderRow = {
  order_id: number;
  tracking_code: string;
  current_status: string;
  created_at: string;
  origin_warehouse_id?: number | null;
  destination_warehouse_id?: number | null;
  current_warehouse_id?: number | null;
};

type WarehouseMeta = {
  warehouse_id?: number;
  id?: number;
  name: string;
  code: string;
  region: string;
  address?: string;
  is_sorting_hub?: number | boolean;
};

type ActionConfig = {
  label: string;
  targetStatus: string;
  targetWarehouseId?: number | null;
  note?: string;
};

const SECTION_CONFIG = [
  {
    key: "waiting",
    baseLabel: "Đơn chờ tiếp nhận",
    color: "bg-orange-500/10 text-orange-400",
    statuses: ["waiting_for_pickup", "picked_up"],
  },
  {
    key: "origin",
    baseLabel: "Tại kho gửi",
    color: "bg-purple-500/10 text-purple-400",
    statuses: ["arrived_at_origin_hub"],
  },
  {
    key: "to-sorting",
    baseLabel: "Đang tới kho trung tâm",
    color: "bg-yellow-500/10 text-yellow-400",
    statuses: ["in_transit_to_sorting_center"],
  },
  {
    key: "sorting",
    baseLabel: "Tại kho trung tâm",
    color: "bg-blue-500/10 text-blue-400",
    statuses: ["arrived_at_sorting_hub"],
  },
  {
    key: "to-destination",
    baseLabel: "Đang tới kho đích",
    color: "bg-teal-500/10 text-teal-400",
    statuses: ["in_transit_to_destination_hub"],
  },
  {
    key: "destination",
    baseLabel: "Tại kho đích",
    color: "bg-emerald-500/10 text-emerald-400",
    statuses: ["arrived_at_destination_hub"],
  },
] as const;

const isSortingHub = (w?: WarehouseMeta) => {
  if (!w) return false;
  if (typeof w.is_sorting_hub === "boolean") return w.is_sorting_hub;
  if (typeof w.is_sorting_hub === "number") return w.is_sorting_hub === 1;
  return false;
};

export default function SortingPage() {
  const { user } = useAuth();
  const warehouseId = user?.warehouse_id != null ? Number(user.warehouse_id) : null;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseMeta[]>([]);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!warehouseId) return;
    reload();
  }, [warehouseId]);

  useEffect(() => {
    fetch("/api/warehouses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWarehouses(data);
      })
      .catch(() => {});
  }, []);

  const warehousesMap = useMemo(() => {
    const map = new Map<number, WarehouseMeta>();
    warehouses.forEach((w: any) => {
      const key = Number(w.warehouse_id ?? w.id);
      if (!Number.isNaN(key)) map.set(key, w);
    });
    return map;
  }, [warehouses]);

  const userWarehouse = warehouseId != null ? warehousesMap.get(warehouseId) : undefined;

  const reload = () => {
    if (!warehouseId) return;
    fetch(`/api/orders/warehouse/${warehouseId}`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  };

  const sameWh = (val?: number | string | null) => warehouseId != null && val != null && Number(val) === warehouseId;
  const isOrigin = (o: OrderRow) => sameWh(o.origin_warehouse_id ?? null);
  const isDest = (o: OrderRow) => sameWh(o.destination_warehouse_id ?? null);
  const ownsCurrent = (o: OrderRow) => sameWh(o.current_warehouse_id ?? null) || (!o.current_warehouse_id && isOrigin(o));

  const sortingHubForRegion = (region?: string) => warehouses.find((w) => w.region === region && isSortingHub(w));
  const resolveSortingHubFor = (o: OrderRow) => {
    const origin = o.origin_warehouse_id ? warehousesMap.get(Number(o.origin_warehouse_id)) : undefined;
    return sortingHubForRegion(origin?.region) || (userWarehouse && sortingHubForRegion(userWarehouse.region));
  };
  const resolveDestination = (o: OrderRow) =>
    o.destination_warehouse_id ? warehousesMap.get(Number(o.destination_warehouse_id)) : undefined;

  const shouldDisplayInSection = (o: OrderRow, sectionKey: string) => {
    switch (sectionKey) {
      case "waiting":
      case "origin":
        return isOrigin(o);
      case "to-sorting":
      case "sorting":
        return isSortingHub(userWarehouse) && ownsCurrent(o);
      case "to-destination":
      case "destination":
        return isDest(o);
      default:
        return false;
    }
  };

  const grouped = useMemo(() => {
    const b: Record<string, OrderRow[]> = {};
    for (const s of SECTION_CONFIG) b[s.key] = [];
    for (const o of orders) {
      const s = SECTION_CONFIG.find((x) => x.statuses.includes(o.current_status));
      if (s && shouldDisplayInSection(o, s.key)) b[s.key].push(o);
    }
    return b;
  }, [orders, warehouseId, userWarehouse]);

  const sectionHeading = (key: string) => {
    const base = SECTION_CONFIG.find((s) => s.key === key)?.baseLabel || "";
    if (!userWarehouse) return base;
    switch (key) {
      case "waiting":
      case "origin":
      case "sorting":
      case "to-destination":
      case "destination":
        return `${base} - ${userWarehouse.name}`;
      case "to-sorting": {
        const hub = resolveSortingHubFor({} as any) || undefined;
        return hub ? `${base} - ${hub.name}` : base;
      }
      default:
        return base;
    }
  };

  const mutateStatus = async (
    orderId: number,
    targetStatus: string,
    whTarget?: number | null,
    note?: string
  ) => {
    const payload = {
      status: targetStatus,
      warehouse_id: whTarget ?? warehouseId,
      note,
    };
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Không thể cập nhật trạng thái");
    }
  };

  const primaryActionFor = (o: OrderRow): ActionConfig | null => {
    if (!warehouseId) return null;
    switch (o.current_status) {
      case "waiting_for_pickup":
        if (!isOrigin(o) && !ownsCurrent(o)) return null;
        if (isOrigin(o) && isDest(o)) {
          return {
            label: "Tiếp nhận đơn",
            targetStatus: "arrived_at_destination_hub",
            targetWarehouseId: warehouseId,
            note: "Kho đã tiếp nhận hàng",
          };
        }
        return {
          label: "Tiếp nhận đơn",
          targetStatus: "arrived_at_origin_hub",
          targetWarehouseId: warehouseId,
          note: "Kho đã tiếp nhận hàng",
        };
      case "picked_up":
        if (!isOrigin(o) && !ownsCurrent(o)) return null;
        if (isOrigin(o) && isDest(o)) {
          return {
            label: "Xác nhận vào kho",
            targetStatus: "arrived_at_destination_hub",
            targetWarehouseId: warehouseId,
          };
        }
        return {
          label: "Xác nhận vào kho",
          targetStatus: "arrived_at_origin_hub",
          targetWarehouseId: warehouseId,
        };
      case "arrived_at_origin_hub": {
        if (!isOrigin(o)) return null;
        const dest = resolveDestination(o);
        const origin = o.origin_warehouse_id ? warehousesMap.get(Number(o.origin_warehouse_id)) : undefined;
        if (dest && origin && origin.region === dest.region) {
          const destId = Number(dest.warehouse_id ?? dest.id);
          return {
            label: `Chuyển đến kho đích - ${dest.name}`,
            targetStatus: "in_transit_to_destination_hub",
            targetWarehouseId: destId,
            note: `Đi ${dest.name}`,
          };
        }
        const hub = resolveSortingHubFor(o);
        if (!hub) return null;
        const hubId = Number(hub.warehouse_id ?? hub.id);
        return {
          label: `Chuyển đến kho trung tâm - ${hub.name}`,
          targetStatus: "in_transit_to_sorting_center",
          targetWarehouseId: hubId,
          note: `Đi ${hub.name}`,
        };
      }
      case "in_transit_to_sorting_center":
        if (!isSortingHub(userWarehouse) || !ownsCurrent(o)) return null;
        return {
          label: "Tiếp nhận đơn",
          targetStatus: "arrived_at_sorting_hub",
          targetWarehouseId: warehouseId,
          note: "Kho trung tâm đã nhận",
        };
      case "arrived_at_sorting_hub": {
        if (!isSortingHub(userWarehouse) || !ownsCurrent(o)) return null;
        const dest = resolveDestination(o);
        if (!dest) return null;
        const destId = Number(dest.warehouse_id ?? dest.id);
        return {
          label: `Chuyển đến kho đích - ${dest.name}`,
          targetStatus: "in_transit_to_destination_hub",
          targetWarehouseId: destId,
          note: `Đi ${dest.name}`,
        };
      }
      case "in_transit_to_destination_hub":
        if (!isDest(o)) return null;
        return {
          label: "Tiếp nhận đơn",
          targetStatus: "arrived_at_destination_hub",
          targetWarehouseId: warehouseId,
          note: "Kho đích đã nhận",
        };
      default:
        return null;
    }
  };

  const handleAction = async (o: OrderRow, action: ActionConfig | null) => {
    if (!action) return;
    if (action.targetWarehouseId == null) {
      setMessage("Chưa xác định được kho kế tiếp");
      return;
    }
    setBusyOrderId(o.order_id);
    setMessage("");
    try {
      await mutateStatus(o.order_id, action.targetStatus, action.targetWarehouseId, action.note);
      setMessage(`Đã cập nhật ${o.tracking_code} → ${action.targetStatus}`);
      reload();
    } catch (e: any) {
      setMessage(e?.message || "Có lỗi xảy ra");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleBulkReceiveSorting = async () => {
    if (!warehouseId || !isSortingHub(userWarehouse)) return;
    const candidates = (grouped["to-sorting"] || []).filter((o) => o.current_status === "in_transit_to_sorting_center");
    if (!candidates.length) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Tiếp nhận tất cả ${candidates.length} đơn đang đến kho trung tâm?`);
      if (!ok) return;
    }
    setBulkBusy(true);
    setMessage("");
    try {
      await Promise.all(
        candidates.map((o) =>
          mutateStatus(o.order_id, "arrived_at_sorting_hub", warehouseId, "Kho trung tâm nhận hàng (loạt)")
        )
      );
      setMessage(`Đã tiếp nhận ${candidates.length} đơn đến kho trung tâm`);
      reload();
    } catch (e: any) {
      setMessage(e?.message || "Không thể tiếp nhận tất cả đơn");
    } finally {
      setBulkBusy(false);
    }
  };

  const canReturnToOrigin = (status: string) => ["arrived_at_destination_hub", "arrived_at_sorting_hub"].includes(status);
  const canFinishReturn = (status: string) => status === "return_in_transit";

  const handleReturn = async (o: OrderRow) => {
    if (!warehouseId) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Gửi trả kho gốc đơn ${o.tracking_code}?`);
      if (!ok) return;
    }
    setBusyOrderId(o.order_id);
    try {
      // Không truyền warehouse_id để backend tự suy ra kho gốc
      await mutateStatus(o.order_id, "return_in_transit", undefined, "Gửi trả kho gốc");
      setMessage(`Đã chuyển ${o.tracking_code} sang hoàn hàng`);
      reload();
    } catch (e: any) {
      setMessage(e?.message || "Không thể gửi trả kho gốc");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleFinishReturn = async (o: OrderRow) => {
    if (!warehouseId) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Xác nhận ${o.tracking_code} đã hoàn về kho gốc?`);
      if (!ok) return;
    }
    setBusyOrderId(o.order_id);
    try {
      // Không truyền warehouse_id để backend tự suy ra kho gốc
      await mutateStatus(o.order_id, "returned_to_origin", undefined, "Đã hoàn về kho gốc");
      setMessage(`Đơn ${o.tracking_code} đã hoàn tất hoàn hàng`);
      reload();
    } catch (e: any) {
      setMessage(e?.message || "Không thể cập nhật trạng thái hoàn hàng");
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">Quản lý luồng kho</h1>
          <p className="text-secondary">Theo dõi và cập nhật các đơn đang chờ xử lý tại kho của bạn.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {SECTION_CONFIG.map((s) => (
            <div key={s.key} className={`${s.color} rounded-lg border border-default p-6`}>
              <p className="text-sm text-secondary">{sectionHeading(s.key)}</p>
              <p className="text-3xl font-bold">{grouped[s.key]?.length || 0}</p>
            </div>
          ))}
        </div>

        {message && <div className="rounded-lg border border-default bg-background p-3 text-sm">{message}</div>}

        <div className="space-y-6">
          {SECTION_CONFIG.map((s) => {
            const sectionOrders = grouped[s.key] || [];
            const sectionLabel = sectionHeading(s.key);
            const showBulk = s.key === "to-sorting" && isSortingHub(userWarehouse);
            return (
              <div key={s.key} className="overflow-hidden rounded-xl border border-default bg-surface">
                <div className="flex items-center justify-between border-b border-default bg-background p-6">
                  <h3 className="font-semibold">{sectionLabel}</h3>
                  {showBulk && sectionOrders.length > 0 && (
                    <button
                      className="rounded bg-primary px-3 py-1 text-sm text-background disabled:opacity-50"
                      disabled={bulkBusy}
                      onClick={handleBulkReceiveSorting}
                    >
                      {bulkBusy ? "Đang tiếp nhận..." : "Tiếp nhận tất cả"}
                    </button>
                  )}
                </div>
                <div className="divide-y divide-default">
                  {sectionOrders.length === 0 && (
                    <div className="p-6 text-sm text-secondary">Chưa có đơn phù hợp.</div>
                  )}
                  {sectionOrders.map((o) => {
                    const action = primaryActionFor(o);
                    return (
                      <div key={o.order_id} className="p-6 transition-colors hover:bg-background">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-primary">{o.tracking_code}</p>
                            <p className="text-sm text-secondary">
                              Trạng thái:{" "}
                              <span className="font-medium text-foreground">{o.current_status}</span>
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-lg px-3 py-1 text-xs font-medium ${s.color}`}>{sectionLabel}</span>
                            {action && (
                              <button
                                className="rounded bg-primary px-3 py-1 text-xs text-background disabled:opacity-50"
                                disabled={busyOrderId === o.order_id}
                                onClick={() => handleAction(o, action)}
                              >
                                {busyOrderId === o.order_id ? "Đang cập nhật..." : action.label}
                              </button>
                            )}
                            {canReturnToOrigin(o.current_status) && (
                              <button
                                className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                                disabled={busyOrderId === o.order_id}
                                onClick={() => handleReturn(o)}
                              >
                                Gửi trả kho gốc
                              </button>
                            )}
                            {canFinishReturn(o.current_status) && (
                              <button
                                className="rounded bg-red-600/80 px-3 py-1 text-xs text-white disabled:opacity-50"
                                disabled={busyOrderId === o.order_id}
                                onClick={() => handleFinishReturn(o)}
                              >
                                Hoàn tất hoàn hàng
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-secondary">
                          Ngày tạo:{" "}
                          {new Date(o.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}