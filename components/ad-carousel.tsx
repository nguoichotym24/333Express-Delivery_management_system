"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface AdSlide {
  id: number
  title: string
  subtitle: string
  image: string
}

const adSlides: AdSlide[] = [
  {
    id: 1,
    title: "NHANH",
    subtitle: "Giao hàng nhanh chóng",
    image: "/fast-delivery.png",
  },
  {
    id: 2,
    title: "RẺ",
    subtitle: "Giá cước cạnh tranh",
    image: "/affordable-shipping-rates.jpg",
  },
  {
    id: 3,
    title: "AN TOÀN",
    subtitle: "Bảo vệ hàng hóa tối đa",
    image: "/secure-package-delivery.jpg",
  },
  {
    id: 4,
    title: "TIỆN LỢI",
    subtitle: "Dễ dàng quản lý đơn hàng",
    image: "/convenient-delivery-management.jpg",
  },
]

export function AdCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adSlides.length)
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
    goToSlide((currentSlide + 1) % adSlides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + adSlides.length) % adSlides.length)
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-none group">
      {/* Slides */}
      <div className="relative w-full h-full">
        {adSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 via-orange-400/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-end pr-12 md:pr-20">
              <div className="text-right space-y-4">
                <h2 className="text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-lg">{slide.title}</h2>
                <p className="text-xl md:text-2xl text-white drop-shadow-md">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {adSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
