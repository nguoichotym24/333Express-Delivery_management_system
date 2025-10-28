"use client"

import type React from "react"

import type { ReactElement } from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { calculateShippingFee, defaultShippingConfig } from "@/lib/shipping-fee-calculator"
import type { ShippingFeeConfig } from "@/lib/shipping-fee-calculator"

export default function CreateOrderPage(): ReactElement {
  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    phone: "",
    address: "",
    productName: "",
    quantity: 1,
    price: 0,
    image: "",
    notes: "",
    weight: 1,
    region: "same_province" as "same_province" | "other_province" | "inter_region",
  })

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [shippingConfig, setShippingConfig] = useState<ShippingFeeConfig>(defaultShippingConfig)

  useState(() => {
    const saved = localStorage.getItem("shippingConfig")
    if (saved) {
      setShippingConfig(JSON.parse(saved))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" || name === "weight" ? Number(value) : value,
    }))
  }

  const addItem = () => {
    if (formData.productName && formData.quantity > 0 && formData.price > 0) {
      setItems([
        ...items,
        {
          id: Date.now(),
          name: formData.productName,
          quantity: formData.quantity,
          price: formData.price,
          image: formData.image,
        },
      ])
      setFormData((prev) => ({
        ...prev,
        productName: "",
        quantity: 1,
        price: 0,
        image: "",
      }))
    }
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const shippingFee = calculateShippingFee(formData.region, formData.weight, shippingConfig)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate order creation
      const newOrder = {
        id: `ORD_${Date.now()}`,
        trackingNumber: `DH${Date.now()}`,
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        items: items,
        weight: formData.weight,
        region: formData.region,
        shippingFee: shippingFee,
        totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "order_created",
        createdAt: new Date().toISOString(),
      }

      // Store in localStorage for demo
      const orders = JSON.parse(localStorage.getItem("seller_orders") || "[]")
      orders.push(newOrder)
      localStorage.setItem("seller_orders", JSON.stringify(orders))

      alert(
        `Đơn hàng được tạo thành công!\nMã vận đơn: ${newOrder.trackingNumber}\nPhí vận chuyển: ${shippingFee.toLocaleString("vi-VN")} đ`,
      )
      setFormData({
        customerName: "",
        customerId: "",
        phone: "",
        address: "",
        productName: "",
        quantity: 1,
        price: 0,
        image: "",
        notes: "",
        weight: 1,
        region: "same_province",
      })
      setItems([])
    } catch (error) {
      alert("Lỗi khi tạo đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Tạo đơn hàng mới</h1>
          <p className="text-secondary">Nhập thông tin khách hàng và sản phẩm</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Thông tin khách hàng</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên khách hàng</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Nhập tên khách hàng"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ID khách hàng (tùy chọn)</label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    placeholder="Nhập ID khách hàng"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Địa chỉ giao hàng"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Khối lượng (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      placeholder="Nhập khối lượng"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Khu vực giao hàng</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="same_province">Nội tỉnh</option>
                      <option value="other_province">Liên tỉnh</option>
                      <option value="inter_region">Liên miền</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Thêm sản phẩm</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Nhập tên sản phẩm"
                    className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Số lượng</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá (đ)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ảnh sản phẩm (URL)</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="URL ảnh"
                      className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  className="w-full bg-primary text-background hover:bg-[#00A8CC]"
                >
                  Thêm sản phẩm
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface border border-default rounded-xl p-8">
              <h3 className="font-semibold mb-6">Ghi chú</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Nhập ghi chú cho đơn hàng"
                rows={4}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-default rounded-xl p-8 sticky top-6">
              <h3 className="font-semibold mb-6">Tóm tắt đơn hàng</h3>

              {/* Items List */}
              <div className="mb-6 space-y-3 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-secondary text-sm text-center py-4">Chưa có sản phẩm</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="bg-background rounded-lg p-3 border border-default">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-secondary text-xs mb-1">SL: {item.quantity}</p>
                      <p className="text-primary font-semibold text-sm">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-default pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Tổng tiền hàng</span>
                  <span className="font-medium">{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Phí vận chuyển</span>
                  <span className="font-medium">{shippingFee.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="border-t border-default pt-2 flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-primary font-bold">
                    {(totalAmount + shippingFee).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-primary text-background hover:bg-[#00A8CC] mt-6"
              >
                {loading ? "Đang tạo..." : "Tạo đơn hàng"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
