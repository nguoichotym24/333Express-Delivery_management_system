"use client"

import type React from "react"
import { useEffect, useState } from "react"

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
    setTimeout(() => setSaved(false), 2500)
  }

  const handleShippingFeeSave = () => {
    try {
      localStorage.setItem("shippingConfig", JSON.stringify(shippingConfig))
    } catch {}
    setShippingFeeSaved(true)
    setTimeout(() => setShippingFeeSaved(false), 2500)
  }

  useEffect(() => {
    setLoadingFeeRules(true)
    fetch('/api/admin/fee-rules')
      .then(r => r.json())
      .then((data) => setFeeRules(Array.isArray(data) ? data : []))
      .finally(() => setLoadingFeeRules(false))

    setLoadingWarehouses(true)
    fetch('/api/warehouses')
      .then(r => r.json())
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .finally(() => setLoadingWarehouses(false))
  }, [])

  const exampleSameProvinceUnderBase = shippingConfig.domesticSameProvince
  const exampleSameProvinceOver = shippingConfig.domesticSameProvince + 2 * shippingConfig.additionalWeightFee
  const exampleInterRegion = shippingConfig.interRegion + 1 * shippingConfig.additionalWeightFee

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Cấu hình hệ thống</h1>
          <p className="text-secondary">Quản lý phí vận chuyển, hoa hồng và các thiết lập chung</p>
        </div>

        {/* Success Messages */}
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
              <input
                type="number"
                name="domesticSameProvince"
                value={shippingConfig.domesticSameProvince}
                onChange={handleShippingConfigChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Giao hàng trong cùng tỉnh</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Liên tỉnh (₫)</label>
              <input
                type="number"
                name="domesticOtherProvince"
                value={shippingConfig.domesticOtherProvince}
                onChange={handleShippingConfigChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Giao hàng giữa các tỉnh</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Liên miền (₫)</label>
              <input
                type="number"
                name="interRegion"
                value={shippingConfig.interRegion}
                onChange={handleShippingConfigChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Giao hàng giữa các miền</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giới hạn cân nặng (kg)</label>
              <input
                type="number"
                name="baseWeightLimit"
                value={shippingConfig.baseWeightLimit}
                onChange={handleShippingConfigChange}
                min={1}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Cân nặng tối đa áp cho phí cơ bản</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phí thêm/kg (₫)</label>
              <input
                type="number"
                name="additionalWeightFee"
                value={shippingConfig.additionalWeightFee}
                onChange={handleShippingConfigChange}
                min={0}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Phí cho mỗi kg vượt quá giới hạn</p>
            </div>
          </div>

          {/* Shipping Fee Examples */}
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

        {/* General Settings */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6">Cấu hình chung</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Hoa hồng hệ thống (%)</label>
              <input
                type="number"
                name="commissionRate"
                value={settings.commissionRate}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Phần trăm hoa hồng thu từ mỗi giao hàng</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Giá trị đơn hàng tối đa (₫)</label>
              <input
                type="number"
                name="maxOrderValue"
                value={settings.maxOrderValue}
                onChange={handleChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Giới hạn giá trị cho một đơn hàng</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Giờ hoạt động</label>
              <input
                type="text"
                name="operatingHours"
                value={settings.operatingHours}
                onChange={handleChange}
                placeholder="06:00 - 22:00"
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Khung giờ hệ thống hoạt động</p>
            </div>
          </div>
        </div>

        {/* Support Settings */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6">Thông tin hỗ trợ</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email hỗ trợ</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Email liên hệ hỗ trợ khách hàng</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại hỗ trợ</label>
              <input
                type="tel"
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Số liên hệ hỗ trợ khách hàng</p>
            </div>
          </div>
        </div>

        {/* Fee rules from DB (read-only) */}
        <div className="bg-surface border border-default rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Bảng phí từ cơ sở dữ liệu</h2>
          <p className="text-secondary text-sm mb-6">Hiển thị các luật tính phí hiện hành (chỉ đọc)</p>
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
                </tr>
              </thead>
              <tbody>
                {loadingFeeRules ? (
                  <tr key="loading-fee"><td className="px-4 py-4 text-secondary" colSpan={7}>Đang tải...</td></tr>
                ) : feeRules.length === 0 ? (
                  <tr key="empty-fee"><td className="px-4 py-4 text-secondary" colSpan={7}>Chưa có dữ liệu</td></tr>
                ) : (
                  feeRules.map((r) => (
                    <tr key={r.id} className="border-b border-default">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.within_province ? 'Nội tỉnh' : `${r.from_region ?? '-'} → ${r.to_region ?? '-'}`}</td>
                      <td className="px-4 py-3">{r.base_fee.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">{r.base_weight_kg}</td>
                      <td className="px-4 py-3">{r.max_weight_kg}</td>
                      <td className="px-4 py-3">{r.extra_fee_per_kg.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">{r.enabled ? 'Bật' : 'Tắt'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouses list from DB (read-only) */}
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
