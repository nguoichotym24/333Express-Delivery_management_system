"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  image: string
  color: string
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Giao hàng nhanh",
    subtitle: "Đơn hàng của bạn sẽ đến đích trong thời gian ngắn nhất",
    image: "/fast-delivery-service.jpg",
    color: "from-blue-600/30 to-blue-400/30",
  },
  {
    id: 2,
    title: "Giá cước rẻ",
    subtitle: "Cước phí cạnh tranh, minh bạch và không có phí ẩn",
    image: "/affordable-shipping-rates.jpg",
    color: "from-green-600/30 to-green-400/30",
  },
  {
    id: 3,
    title: "An toàn tuyệt đối",
    subtitle: "Hàng hóa được bảo vệ toàn bộ quá trình vận chuyển",
    image: "/secure-package-delivery.jpg",
    color: "from-purple-600/30 to-purple-400/30",
  },
  {
    id: 4,
    title: "Tiện lợi và dễ dàng",
    subtitle: "Quản lý đơn hàng chỉ với vài cú click trên điện thoại",
    image: "/convenient-delivery-management.jpg",
    color: "from-orange-600/30 to-orange-400/30",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
    // Resume auto-play after 10 seconds of user interaction
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  const slide = slides[currentSlide]

  return (
    <div
      className="relative w-full h-60 md:h-[300px] overflow-hidden rounded-none"
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Slides */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <img src={s.image || "/placeholder.svg"} alt={s.title} className="w-full h-full object-cover" />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.color} opacity-60`} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">{s.title}</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl text-balance">{s.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Đi đến slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
