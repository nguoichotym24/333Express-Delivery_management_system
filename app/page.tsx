"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Package, Truck, MapPin, Clock, CheckCircle } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"
import Image from "next/image"

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [trackingId, setTrackingId] = useState("")
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [isAuthenticated, user, router])

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError("")

    if (!trackingId.trim()) {
      setSearchError("Vui lòng nhập mã đơn hàng")
      return
    }

    // Navigate to tracking page
    router.push(`/tracking/${trackingId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-default sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-43 h-14 bg-surface rounded-lg flex items-center justify-center">
              <span className="text-background font-bold">
                <Image
                  src="/333-r-logo.png"
                  alt="TRIPLE3 Express Logo"
                  width={172}
                  height={56}
                  className="rounded-md vt-logo"
                />
              </span>
            </div>
            <span className="font-bold text-lg"></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="bg-transparent">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-background hover:bg-[#00A8CC] transition-colors">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <HeroCarousel />
        </div>
      </section>

      {/* Hero Section with Tracking */}
      <section className="bg-gradient-to-b from-surface to-background py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              Giao hàng <span className="text-primary">nhanh chóng</span> và{" "}
              <span className="text-primary">an toàn</span>
            </h1>
            <p className="text-xl text-secondary mb-8 text-balance max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-bottom-1 duration-300 delay-100">
              Nền tảng quản lý vận chuyển toàn diện. Theo dõi đơn hàng, tạo đơn mới, và quản lý giao hàng một cách dễ
              dàng
            </p>
          </div>

          {/* Order Tracking Search */}
          <div className="bg-surface border border-default rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Tra cứu đơn hàng</h2>
            <form onSubmit={handleTrackingSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value)
                    setSearchError("")
                  }}
                  placeholder="Nhập mã đơn hàng (VD: DH123456)"
                  className="w-full bg-background border border-default rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary text-background hover:bg-[#00A8CC] transition-colors px-8 py-3"
              >
                Tra cứu
              </Button>
            </form>
            {searchError && <p className="text-red-400 text-sm mt-3">{searchError}</p>}
            <p className="text-secondary text-sm mt-4 text-center">Không cần đăng nhập để tra cứu đơn hàng</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button className="bg-primary text-background hover:bg-[#00A8CC] transition-colors px-8 py-6 text-lg">
                Tạo đơn hàng ngay
              </Button>
            </Link>
            <Link href="/ads">
              <Button variant="outline" className="bg-transparent px-8 py-6 text-lg">
                Giới thiệu 
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Tính năng chính</h2>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                icon: Package,
                title: "Tạo đơn hàng",
                description: "Tạo đơn hàng nhanh chóng với thông tin người nhận, địa chỉ lấy hàng và giao hàng",
              },
              {
                icon: MapPin,
                title: "Theo dõi vị trí",
                description: "Theo dõi vị trí đơn hàng từ kho đến tay khách hàng với bản đồ thời gian thực",
              },
              {
                icon: Truck,
                title: "Giao hàng nhanh",
                description: "Shipper chuyên nghiệp giao hàng nhanh chóng và an toàn đến địa chỉ của bạn",
              },
              {
                icon: Clock,
                title: "Cập nhật thời gian",
                description: "Nhận thông báo cập nhật về trạng thái đơn hàng theo thời gian thực",
              },
              {
                icon: CheckCircle,
                title: "Xác nhận giao hàng",
                description: "Xác nhận giao hàng thành công với chữ ký điện tử và hình ảnh",
              },
              {
                icon: Truck,
                title: "Quản lý kho",
                description: "Quản lý hàng hóa trong kho vận chuyển một cách hiệu quả",
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-surface border border-default rounded-xl p-6 hover:border-primary transition-colors"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-secondary text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface border-y border-default">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Cách hoạt động</h2>
          <div className="grid md:grid-cols-4 gap-8 stagger-children">
            {[
              {
                step: "1",
                title: "Đăng ký tài khoản",
                description: "Tạo tài khoản khách hàng chỉ với tên, email, số điện thoại và mật khẩu",
              },
              {
                step: "2",
                title: "Tạo đơn hàng",
                description: "Nhập thông tin người nhận, địa chỉ lấy hàng và giao hàng",
              },
              {
                step: "3",
                title: "Xác nhận đơn",
                description: "Hệ thống xác nhận đơn hàng và phân công shipper",
              },
              {
                step: "4",
                title: "Theo dõi & nhận",
                description: "Theo dõi đơn hàng và nhận hàng tại địa chỉ giao hàng",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-background font-bold text-2xl">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                <p className="text-secondary text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
        <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
          Tham gia DeliveryHub ngay hôm nay và tối ưu hóa quy trình giao hàng của bạn
        </p>
        <Link href="/signup">
          <Button className="bg-primary text-background hover:bg-[#00A8CC] transition-colors px-8 py-6 text-lg">
            Đăng ký miễn phí
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-default py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-secondary text-sm">
          <p>&copy; 2025 DeliveryHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
