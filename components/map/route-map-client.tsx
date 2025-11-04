"use client"

import { useEffect, useRef, useState } from "react"

type LatLng = { lat: number; lng: number }

type Props = {
  height?: number | string
  sender: LatLng
  receiver: LatLng
  currentWarehouse?: LatLng & { name?: string } | null
  route: Array<LatLng & { label?: string }>
  followRoads?: boolean
  lastUpdate?: LatLng | null
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

export default function RouteMapClient({ height = 360, sender, receiver, currentWarehouse, route, followRoads = false, lastUpdate }: Props) {
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
    let lastUpdateMarker: any = null
    if (lastUpdate) {
      lastUpdateMarker = L.circleMarker([lastUpdate.lat, lastUpdate.lng], {
        radius: 6,
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map).bindPopup('Cập nhật gần nhất')
    }

    const straightPoints = [sender, ...route, receiver]

    const addStraight = () => L.polyline(straightPoints.map(p => [p.lat, p.lng]), { color: '#2563eb', weight: 4 }).addTo(map)

    let poly: any = null

    const fitAll = () => {
      const features: any[] = [senderMarker, receiverMarker]
      if (poly) features.push(poly)
      if (currentMarker) features.push(currentMarker)
      if (lastUpdateMarker) features.push(lastUpdateMarker)
      const group = L.featureGroup(features)
      map.fitBounds(group.getBounds().pad(0.2))
    }

    if (!followRoads) {
      poly = addStraight()
      fitAll()
    } else {
      const coords = straightPoints.map(p => `${p.lng},${p.lat}`).join(';')
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      fetch(url)
        .then(r => r.json())
        .then((data) => {
          const g = data?.routes?.[0]?.geometry
          if (g && g.type === 'LineString' && Array.isArray(g.coordinates)) {
            const latlngs = g.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
            poly = L.polyline(latlngs, { color: '#2563eb', weight: 4 }).addTo(map)
          } else {
            poly = addStraight()
          }
          fitAll()
        })
        .catch(() => {
          poly = addStraight()
          fitAll()
        })
    }

    return () => {
      map.remove()
    }
  }, [ready, sender, receiver, currentWarehouse, route, followRoads, lastUpdate])

  return (
    <div className="rounded-xl overflow-hidden border border-default bg-surface">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
