"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import type { ShippingFeeConfig } from "@/lib/shipping-fee-calculator"
import { defaultShippingConfig } from "@/lib/shipping-fee-calculator"

type FeeRule = {
  id: number
  name: string
  from_region: string | null
  to_region: string | null
  within_province: 0 | 1
  base_fee: number
  base_weight_kg: number
  max_weight_kg: number
  extra_fee_per_kg: number
  enabled: 0 | 1
}

type Warehouse = {
  warehouse_id: number
  code: string
  name: string
  province: string
  region: string
  address: string
  lat: number
  lng: number
  capacity: number
  is_sorting_hub: 0 | 1
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    commissionRate: 25,
    maxOrderValue: 100000000,
    operatingHours: "06:00 - 22:00",
    supportEmail: "support@deliveryhub.com",
    supportPhone: "1900-1234",
  })

  const [shippingConfig, setShippingConfig] = useState<ShippingFeeConfig>(defaultShippingConfig)
  const [saved, setSaved] = useState(false)
  const [shippingFeeSaved, setShippingFeeSaved] = useState(false)

  const [feeRules, setFeeRules] = useState<FeeRule[]>([])
  const [loadingFeeRules, setLoadingFeeRules] = useState(true)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)

  // CRUD states for fee rules
  const [creating, setCreating] = useState(false)
  const [newRule, setNewRule] = useState({
    name: "",
    within_province: true,
    from_region: "north",
    to_region: "north",
    base_fee: 25000,
    base_weight_kg: 1,
    max_weight_kg: 50,
    extra_fee_per_kg: 0,
    enabled: true,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<FeeRule>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: name === "commissionRate" || name === "maxOrderValue" ? Number(value) : value,
    }))
  }

  const handleShippingConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingConfig((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleShippingFeeSave = () => {
    try { localStorage.setItem("shippingConfig", JSON.stringify(shippingConfig)) } catch {}
    setShippingFeeSaved(true)
    setTimeout(() => setShippingFeeSaved(false), 2000)
  }

  const reloadFeeRules = () => {
    setLoadingFeeRules(true)
    fetch('/api/admin/fee-rules')
      .then(r => r.json())
      .then((data) => setFeeRules(Array.isArray(data) ? data : []))
      .finally(() => setLoadingFeeRules(false))
  }

  useEffect(() => {
    reloadFeeRules()
    setLoadingWarehouses(true)
    fetch('/api/warehouses')
      .then(r => r.json())
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .finally(() => setLoadingWarehouses(false))
  }, [])

  const exampleSameProvinceUnderBase = shippingConfig.domesticSameProvince
  const exampleSameProvinceOver = shippingConfig.domesticSameProvince + 2 * shippingConfig.additionalWeightFee
  const exampleInterRegion = shippingConfig.interRegion + 1 * shippingConfig.additionalWeightFee

  const regionOptions = useMemo(() => ['north','central','south'], [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cấu hình hệ thống</h1>
          <p className="text-secondary">Quản lý phí vận chuyển, hoa hồng và các thiết lập chung</p>
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm">Đã lưu cấu hình chung</div>
        )}
        {shippingFeeSaved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm">Đã lưu cấu hình phí vận chuyển (cục bộ)</div>
        )}

        {/* Shipping Fee Config (client-side mock) */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Cấu hình phí vận chuyển</h2>
          <p className="text-secondary text-sm mb-6">Thiết lập mức phí theo khu vực và khối lượng đơn hàng</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Nội tỉnh (₫)</label>
              <input type="number" name="domesticSameProvince" value={shippingConfig.domesticSameProvince} onChange={handleShippingConfigChange} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-secondary text-xs mt-2">Giao hàng trong cùng tỉnh</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Liên tỉnh (₫)</label>
              <input type="number" name="domesticOtherProvince" value={shippingConfig.domesticOtherProvince} onChange={handleShippingConfigChange} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-secondary text-xs mt-2">Giao hàng giữa các tỉnh</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Liên miền (₫)</label>
              <input type="number" name="interRegion" value={shippingConfig.interRegion} onChange={handleShippingConfigChange} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-secondary text-xs mt-2">Giao hàng giữa các miền</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Giới hạn cân nặng (kg)</label>
              <input type="number" name="baseWeightLimit" value={shippingConfig.baseWeightLimit} onChange={handleShippingConfigChange} min={1} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phí thêm/kg (₫)</label>
              <input type="number" name="additionalWeightFee" value={shippingConfig.additionalWeightFee} onChange={handleShippingConfigChange} min={0} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-default mb-6">
            <p className="font-medium mb-3">Ví dụ tính phí:</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-secondary mb-1">Nội tỉnh, dưới {shippingConfig.baseWeightLimit}kg:</p>
                <p className="text-primary font-semibold">{exampleSameProvinceUnderBase.toLocaleString("vi-VN")} ₫</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Nội tỉnh, {shippingConfig.baseWeightLimit + 2}kg:</p>
                <p className="text-primary font-semibold">{exampleSameProvinceOver.toLocaleString("vi-VN")} ₫</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Liên miền, 6kg:</p>
                <p className="text-primary font-semibold">{exampleInterRegion.toLocaleString("vi-VN")} ₫</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleShippingFeeSave} className="bg-primary text-background hover:bg-[#00A8CC]">Lưu cấu hình phí vận chuyển</Button>
          </div>
        </div>

        {/* Bảng phí - CRUD */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Bảng phí từ cơ sở dữ liệu</h2>
          <p className="text-secondary text-sm mb-6">Thêm/sửa/xóa luật tính phí</p>

          {/* Create form */}
          <div className="mb-6 grid md:grid-cols-3 gap-4">
            <input className="bg-background border border-default rounded-lg px-3 py-2" placeholder="Tên luật" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} />
            <select className="bg-background border border-default rounded-lg px-3 py-2" value={newRule.within_province ? '1' : '0'} onChange={(e) => setNewRule({ ...newRule, within_province: e.target.value === '1' })}>
              <option value="1">Nội tỉnh</option>
              <option value="0">Theo miền</option>
            </select>
            {!newRule.within_province && (
              <div className="grid grid-cols-2 gap-2">
                <select className="bg-background border border-default rounded-lg px-3 py-2" value={newRule.from_region} onChange={(e) => setNewRule({ ...newRule, from_region: e.target.value })}>
                  {regionOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
                <select className="bg-background border border-default rounded-lg px-3 py-2" value={newRule.to_region} onChange={(e) => setNewRule({ ...newRule, to_region: e.target.value })}>
                  {regionOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
            )}
            <input type="number" className="bg-background border border-default rounded-lg px-3 py-2" placeholder="Phí cơ bản" value={newRule.base_fee} onChange={(e) => setNewRule({ ...newRule, base_fee: Number(e.target.value) })} />
            <input type="number" className="bg-background border border-default rounded-lg px-3 py-2" placeholder="Cân nặng cơ bản (kg)" value={newRule.base_weight_kg} onChange={(e) => setNewRule({ ...newRule, base_weight_kg: Number(e.target.value) })} />
            <input type="number" className="bg-background border border-default rounded-lg px-3 py-2" placeholder="Tối đa (kg)" value={newRule.max_weight_kg} onChange={(e) => setNewRule({ ...newRule, max_weight_kg: Number(e.target.value) })} />
            <input type="number" className="bg-background border border-default rounded-lg px-3 py-2" placeholder="Phí thêm/kg" value={newRule.extra_fee_per_kg} onChange={(e) => setNewRule({ ...newRule, extra_fee_per_kg: Number(e.target.value) })} />
            <select className="bg-background border border-default rounded-lg px-3 py-2" value={newRule.enabled ? '1' : '0'} onChange={(e) => setNewRule({ ...newRule, enabled: e.target.value === '1' })}>
              <option value="1">Bật</option>
              <option value="0">Tắt</option>
            </select>
            <div className="flex items-center">
              <Button disabled={creating || !newRule.name} onClick={async () => {
                setCreating(true)
                try {
                  const payload: any = { name: newRule.name, within_province: newRule.within_province ? 1 : 0, base_fee: newRule.base_fee, base_weight_kg: newRule.base_weight_kg, max_weight_kg: newRule.max_weight_kg, extra_fee_per_kg: newRule.extra_fee_per_kg, enabled: newRule.enabled ? 1 : 0 }
                  if (!newRule.within_province) { payload.from_region = newRule.from_region; payload.to_region = newRule.to_region }
                  const res = await fetch('/api/admin/fee-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                  if (!res.ok) { const err = await res.json().catch(()=>({})); alert(err?.error || 'Không thể tạo luật') } else { setNewRule({ name: '', within_province: true, from_region: 'north', to_region: 'north', base_fee: 25000, base_weight_kg: 1, max_weight_kg: 50, extra_fee_per_kg: 0, enabled: true }); reloadFeeRules() }
                } finally { setCreating(false) }
              }} className="bg-primary text-background hover:bg-[#00A8CC]">{creating ? 'Đang thêm...' : 'Thêm luật'}</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Phạm vi</th>
                  <th className="px-4 py-3 text-left">Phí cơ bản (₫)</th>
                  <th className="px-4 py-3 text-left">Cân nặng cơ bản (kg)</th>
                  <th className="px-4 py-3 text-left">Tối đa (kg)</th>
                  <th className="px-4 py-3 text-left">Phí thêm/kg (₫)</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingFeeRules ? (
                  <tr key="loading-fee"><td className="px-4 py-4 text-secondary" colSpan={8}>Đang tải...</td></tr>
                ) : feeRules.length === 0 ? (
                  <tr key="empty-fee"><td className="px-4 py-4 text-secondary" colSpan={8}>Chưa có dữ liệu</td></tr>
                ) : (
                  feeRules.map((r) => (
                    <tr key={r.id} className="border-b border-default">
                      <td className="px-4 py-3">{editingId === r.id ? (<input defaultValue={r.name} onChange={(e)=>setEditData({ ...editData, name: e.target.value as any })} className="bg-background border border-default rounded px-2 py-1" />) : r.name}</td>
                      <td className="px-4 py-3">
                        {editingId === r.id ? (
                          <div className="flex gap-2 items-center">
                            <select defaultValue={r.within_province ? '1' : '0'} onChange={(e)=>setEditData({ ...editData, within_province: (e.target.value==='1') as any })} className="bg-background border border-default rounded px-2 py-1">
                              <option value="1">Nội tỉnh</option>
                              <option value="0">Theo miền</option>
                            </select>
                            {!((editData.within_province ?? r.within_province) as any) && (
                              <>
                                <select defaultValue={r.from_region || 'north'} onChange={(e)=>setEditData({ ...editData, from_region: e.target.value as any })} className="bg-background border border-default rounded px-2 py-1">
                                  {regionOptions.map(x => <option key={x} value={x}>{x}</option>)}
                                </select>
                                <select defaultValue={r.to_region || 'north'} onChange={(e)=>setEditData({ ...editData, to_region: e.target.value as any })} className="bg-background border border-default rounded px-2 py-1">
                                  {regionOptions.map(x => <option key={x} value={x}>{x}</option>)}
                                </select>
                              </>
                            )}
                          </div>
                        ) : (
                          r.within_province ? 'Nội tỉnh' : `${r.from_region ?? '-'} → ${r.to_region ?? '-'}`
                        )}
                      </td>
                      <td className="px-4 py-3">{editingId === r.id ? (<input type="number" defaultValue={r.base_fee as any} onChange={(e)=>setEditData({ ...editData, base_fee: Number(e.target.value) as any })} className="bg-background border border-default rounded px-2 py-1 w-28" />) : r.base_fee.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">{editingId === r.id ? (<input type="number" defaultValue={r.base_weight_kg as any} onChange={(e)=>setEditData({ ...editData, base_weight_kg: Number(e.target.value) as any })} className="bg-background border border-default rounded px-2 py-1 w-20" />) : r.base_weight_kg}</td>
                      <td className="px-4 py-3">{editingId === r.id ? (<input type="number" defaultValue={r.max_weight_kg as any} onChange={(e)=>setEditData({ ...editData, max_weight_kg: Number(e.target.value) as any })} className="bg-background border border-default rounded px-2 py-1 w-20" />) : r.max_weight_kg}</td>
                      <td className="px-4 py-3">{editingId === r.id ? (<input type="number" defaultValue={r.extra_fee_per_kg as any} onChange={(e)=>setEditData({ ...editData, extra_fee_per_kg: Number(e.target.value) as any })} className="bg-background border border-default rounded px-2 py-1 w-28" />) : r.extra_fee_per_kg.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        {editingId === r.id ? (
                          <select defaultValue={r.enabled ? '1' : '0'} onChange={(e)=>setEditData({ ...editData, enabled: (e.target.value==='1') as any })} className="bg-background border border-default rounded px-2 py-1">
                            <option value="1">Bật</option>
                            <option value="0">Tắt</option>
                          </select>
                        ) : (r.enabled ? 'Bật' : 'Tắt')}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {editingId === r.id ? (
                          <>
                            <button className="px-3 py-1 rounded bg-primary text-background" onClick={async ()=>{
                              const payload: any = { ...editData }
                              if (payload.within_province !== undefined) payload.within_province = payload.within_province ? 1 : 0
                              if ((payload as any).enabled !== undefined) payload.enabled = (payload as any).enabled ? 1 : 0
                              const res = await fetch(`/api/admin/fee-rules/${r.id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
                              if (!res.ok) { const err = await res.json().catch(()=>({})); alert(err?.error || 'Không thể cập nhật') } else { setEditingId(null); setEditData({}); reloadFeeRules() }
                            }}>Lưu</button>
                            <button className="px-3 py-1 rounded bg-background border border-default" onClick={()=>{ setEditingId(null); setEditData({}) }}>Huỷ</button>
                          </>
                        ) : (
                          <>
                            <button className="px-3 py-1 rounded bg-background border border-default" onClick={()=>{ setEditingId(r.id); setEditData({}) }}>Sửa</button>
                            <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={async ()=>{
                              if (!confirm('Xoá luật phí này?')) return
                              const res = await fetch(`/api/admin/fee-rules/${r.id}`, { method: 'DELETE' })
                              if (!res.ok && res.status !== 204) { const err = await res.json().catch(()=>({})); alert(err?.error || 'Không thể xoá') } else { reloadFeeRules() }
                            }}>Xoá</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách kho (DB) - read-only */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Danh sách kho</h2>
          <p className="text-secondary text-sm mb-6">Toàn bộ kho trong hệ thống (chỉ đọc)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="px-4 py-3 text-left">Mã kho</th>
                  <th className="px-4 py-3 text-left">Tên kho</th>
                  <th className="px-4 py-3 text-left">Tỉnh/Thành</th>
                  <th className="px-4 py-3 text-left">Vùng</th>
                  <th className="px-4 py-3 text-left">Địa chỉ</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                </tr>
              </thead>
              <tbody>
                {loadingWarehouses ? (
                  <tr key="loading-wh"><td className="px-4 py-4 text-secondary" colSpan={6}>Đang tải...</td></tr>
                ) : warehouses.length === 0 ? (
                  <tr key="empty-wh"><td className="px-4 py-4 text-secondary" colSpan={6}>Chưa có dữ liệu</td></tr>
                ) : (
                  warehouses.map((w, i) => (
                    <tr key={`${w.warehouse_id}-${w.code}-${i}`} className="border-b border-default">
                      <td className="px-4 py-3">{w.code}</td>
                      <td className="px-4 py-3">{w.name}</td>
                      <td className="px-4 py-3">{w.province}</td>
                      <td className="px-4 py-3">{w.region}</td>
                      <td className="px-4 py-3">{w.address}</td>
                      <td className="px-4 py-3">{w.is_sorting_hub ? 'Kho trung tâm' : 'Kho thường'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-background hover:bg-[#00A8CC] px-8">Lưu cấu hình chung</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

