"use client"

import { AdCarousel } from "@/components/ad-carousel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-default sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Quay lại</span>
          </Link>
          <h1 className="text-2xl font-bold">Giới thiệu về TRIPLE3 Express</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Carousel Section */}
          <section>
            <AdCarousel />
          </section>

          {/* Info Section */}
          <section className="bg-surface border border-default rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6">Tại sao chọn DeliveryHub?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Nhanh Chóng</h3>
                <p className="text-secondary">
                  Giao hàng nhanh nhất trong ngành với mạng lưới shipper rộng khắp toàn quốc. Đơn hàng của bạn sẽ được
                  xử lý và giao trong thời gian ngắn nhất.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Rẻ</h3>
                <p className="text-secondary">
                  Giá cước cạnh tranh nhất thị trường. Chúng tôi cam kết mang lại giá trị tốt nhất cho khách hàng mà
                  không ảnh hưởng đến chất lượng dịch vụ.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">An Toàn</h3>
                <p className="text-secondary">
                  Bảo vệ hàng hóa tối đa với bảo hiểm đầy đủ. Mỗi đơn hàng được theo dõi 24/7 để đảm bảo an toàn tuyệt
                  đối.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Tiện Lợi</h3>
                <p className="text-secondary">
                  Quản lý đơn hàng dễ dàng qua ứng dụng di động hoặc website. Theo dõi vị trí, cập nhật trạng thái và
                  liên hệ shipper chỉ với vài cú nhấp chuột.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">
              Tham gia DeliveryHub ngay hôm nay và trải nghiệm dịch vụ giao hàng tốt nhất
            </p>
            <Link href="/signup">
              <Button className="bg-primary text-background hover:bg-primary/90 px-8 py-6 text-lg">
                Đăng ký miễn phí
              </Button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
