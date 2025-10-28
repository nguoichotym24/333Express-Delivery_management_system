"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { ShippingFeeConfig } from "@/lib/shipping-fee-calculator"
import { defaultShippingConfig } from "@/lib/shipping-fee-calculator"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: name === "commissionRate" ? Number(value) : value,
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
    setTimeout(() => setSaved(false), 3000)
  }

  const handleShippingFeeSave = () => {
    localStorage.setItem("shippingConfig", JSON.stringify(shippingConfig))
    setShippingFeeSaved(true)
    setTimeout(() => setShippingFeeSaved(false), 3000)
  }

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
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm">
            Cấu hình đã được lưu thành công
          </div>
        )}

        {shippingFeeSaved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm">
            Cấu hình phí vận chuyển đã được lưu thành công
          </div>
        )}

        <div className="bg-surface border border-default rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Cấu hình phí vận chuyển</h2>
          <p className="text-secondary text-sm mb-6">Thiết lập phí vận chuyển theo khu vực và khối lượng đơn hàng</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Nội tỉnh (đ)</label>
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
              <label className="block text-sm font-medium mb-2">Liên tỉnh (đ)</label>
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
              <label className="block text-sm font-medium mb-2">Liên miền (đ)</label>
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
                min="1"
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-secondary text-xs mt-2">Cân nặng tối đa cho phí cơ bản</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phí thêm/kg (đ)</label>
              <input
                type="number"
                name="additionalWeightFee"
                value={shippingConfig.additionalWeightFee}
                onChange={handleShippingConfigChange}
                min="0"
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
                <p className="text-primary font-semibold">
                  {shippingConfig.domesticSameProvince.toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <p className="text-secondary mb-1">Nội tỉnh, {shippingConfig.baseWeightLimit + 2}kg:</p>
                <p className="text-primary font-semibold">
                  {(shippingConfig.domesticSameProvince + 2 * shippingConfig.additionalWeightFee).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  đ
                </p>
              </div>
              <div>
                <p className="text-secondary mb-1">Liên miền, {shippingConfig.baseWeightLimit + 1}kg:</p>
                <p className="text-primary font-semibold">
                  {(shippingConfig.interRegion + 1 * shippingConfig.additionalWeightFee).toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleShippingFeeSave} className="bg-primary text-background hover:bg-[#00A8CC]">
            Lưu cấu hình phí vận chuyển
          </Button>
        </div>

        {/* General Settings */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* System Settings */}
          <div className="bg-surface border border-default rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6">Cấu hình chung</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tỷ lệ hoa hồng (%)</label>
                <input
                  type="number"
                  name="commissionRate"
                  value={settings.commissionRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-secondary text-xs mt-2">Phần trăm hoa hồng hệ thống từ mỗi giao hàng</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Giá trị đơn hàng tối đa (đ)</label>
                <input
                  type="number"
                  name="maxOrderValue"
                  value={settings.maxOrderValue}
                  onChange={handleChange}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-secondary text-xs mt-2">Giá trị tối đa cho một đơn hàng</p>
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
                <p className="text-secondary text-xs mt-2">Giờ hoạt động của hệ thống</p>
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
                <p className="text-secondary text-xs mt-2">Số điện thoại liên hệ hỗ trợ khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-background hover:bg-[#00A8CC] px-8">
            Lưu cấu hình chung
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
