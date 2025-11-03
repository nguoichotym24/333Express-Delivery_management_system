"use client"

import { useEffect, useRef, useState } from "react"

type LatLng = { lat: number; lng: number }

type Props = {
  height?: number | string
  sender: LatLng
  receiver: LatLng
  currentWarehouse?: LatLng & { name?: string } | null
  route: Array<LatLng & { label?: string }>
}

declare global {
  interface Window {
    L: any
  }
}

function ensureLeafletLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve()
    if ((window as any).L) return resolve()
    const existingCss = document.querySelector("link[data-leaflet-css]")
    if (!existingCss) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.setAttribute('data-leaflet-css', '1')
      document.head.appendChild(link)
    }
    const existing = document.querySelector("script[data-leaflet]")
    if (existing) {
      (existing as HTMLScriptElement).addEventListener('load', () => resolve())
      if ((existing as HTMLScriptElement).readyState === 'complete') resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.defer = true
    script.setAttribute('data-leaflet', '1')
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
}

export default function RouteMapClient({ height = 360, sender, receiver, currentWarehouse, route }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let destroyed = false
    ensureLeafletLoaded().then(() => {
      if (destroyed) return
      setReady(true)
    })
    return () => {
      destroyed = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const L = window.L
    const map = L.map(containerRef.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Markers
    const senderMarker = L.marker([sender.lat, sender.lng]).addTo(map).bindPopup('Người gửi')
    const receiverMarker = L.marker([receiver.lat, receiver.lng]).addTo(map).bindPopup('Người nhận')
    let currentMarker: any = null
    if (currentWarehouse) {
      currentMarker = L.marker([currentWarehouse.lat, currentWarehouse.lng])
        .addTo(map)
        .bindPopup(currentWarehouse.name || 'Kho hiện tại')
    }

    // Route polyline
    const points = [sender, ...route, receiver].map(p => [p.lat, p.lng])
    const poly = L.polyline(points, { color: '#2563eb', weight: 4 }).addTo(map)

    // Fit bounds
    const group = L.featureGroup([senderMarker, receiverMarker, poly, ...(currentMarker ? [currentMarker] : [])])
    map.fitBounds(group.getBounds().pad(0.2))

    return () => {
      map.remove()
    }
  }, [ready, sender, receiver, currentWarehouse, route])

  return (
    <div className="rounded-xl overflow-hidden border border-default bg-surface">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}

