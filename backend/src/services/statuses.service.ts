import { pool } from '../db/pool'

const cache = new Map<string, number>()
const cacheById = new Map<number, { code: string; display_name: string }>()

export async function getStatusIdByCode(code: string): Promise<number> {
  if (cache.has(code)) return cache.get(code) as number
  const [rows] = await pool.query('SELECT order_status_id FROM order_statuses WHERE code = ? LIMIT 1', [code])
  const res = rows as any[]
  if (!res[0]) throw Object.assign(new Error(`Unknown status code: ${code}`), { status: 400 })
  const id = Number(res[0].order_status_id)
  cache.set(code, id)
  return id
}

export async function getStatusById(id: number): Promise<{ code: string; display_name: string } | null> {
  if (cacheById.has(id)) return cacheById.get(id)!
  const [rows] = await pool.query('SELECT code, display_name FROM order_statuses WHERE order_status_id = ? LIMIT 1', [id])
  const res = rows as any[]
  if (!res[0]) return null
  const obj = { code: res[0].code as string, display_name: res[0].display_name as string }
  cacheById.set(id, obj)
  return obj
}

