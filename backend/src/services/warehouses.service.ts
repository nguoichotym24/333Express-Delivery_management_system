import { pool } from '../db/pool'
import { haversineDistanceKm } from '../utils/haversine'

export type Region = 'north' | 'central' | 'south'

export async function listWarehouses() {
  const [rows] = await pool.query('SELECT warehouse_id AS id, code, name, province, region, address, lat, lng, is_sorting_hub FROM warehouses')
  return rows as any[]
}

export async function nearestWarehouse(lat: number, lng: number) {
  const warehouses = await listWarehouses()
  let best: any = null
  let bestDist = Infinity
  for (const w of warehouses) {
    const d = haversineDistanceKm(lat, lng, Number(w.lat), Number(w.lng))
    if (d < bestDist) {
      best = w
      bestDist = d
    }
  }
  return best
}

export async function nearestSortingHub(region: Region) {
  const [rows] = await pool.query(
    'SELECT warehouse_id AS id, code, name, province, region, address, lat, lng FROM warehouses WHERE region = ? AND is_sorting_hub = 1 LIMIT 1',
    [region]
  )
  const res = rows as any[]
  return res[0] || null
}
