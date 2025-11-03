"use client"

import { useEffect, useRef, useState } from "react"

type LatLng = { lat: number; lng: number }

type Props = {
  height?: number | string
  sender: LatLng
  receiver: LatLng
  onChange: (next: { sender: LatLng; receiver: LatLng }) => void
}

declare global {
  interface Window { L: any }
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

export default function LocationPickerClient({ height = 300, sender, receiver, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let destroyed = false
    ensureLeafletLoaded().then(() => { if (!destroyed) setReady(true) })
    return () => { destroyed = true }
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const L = window.L
    const map = L.map(containerRef.current).setView([sender.lat, sender.lng], 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const senderMarker = L.marker([sender.lat, sender.lng], { draggable: true }).addTo(map).bindPopup('Điểm lấy hàng')
    const receiverMarker = L.marker([receiver.lat, receiver.lng], { draggable: true }).addTo(map).bindPopup('Điểm giao hàng')

    const update = () => {
      const s = senderMarker.getLatLng()
      const r = receiverMarker.getLatLng()
      onChange({ sender: { lat: s.lat, lng: s.lng }, receiver: { lat: r.lat, lng: r.lng } })
    }
    senderMarker.on('dragend', update)
    receiverMarker.on('dragend', update)

    // Fit both
    const group = L.featureGroup([senderMarker, receiverMarker])
    map.fitBounds(group.getBounds().pad(0.2))

    return () => { map.remove() }
  }, [ready])

  return <div ref={containerRef} style={{ height }} className="rounded-lg overflow-hidden border border-default bg-surface" />
}

