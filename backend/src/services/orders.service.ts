import { pool } from '../db/pool'
import type { Region } from './warehouses.service'
import { calculateShippingFee } from './fees.service'
import { nearestWarehouse, nearestSortingHub } from './warehouses.service'
import type { OrderStatus } from '../constants/status'
import { AllowedTransitions } from '../constants/status'
import { getStatusIdByCode } from './statuses.service'

export interface CreateOrderInput {
  customerId: number
  sender: { name: string; phone: string; address: string; lat: number; lng: number }
  receiver: { name: string; phone: string; address: string; lat: number; lng: number }
  weightKg: number
}

function regionOfProvinceOrCoords(_province: string | null, lat: number): Region {
  // Simple heuristic by latitude. VN approx: north (>20), central (16..20), south (<16)
  if (lat >= 20) return 'north'
  if (lat >= 16) return 'central'
  return 'south'
}

export async function createOrder(input: CreateOrderInput) {
  const originWh = await nearestWarehouse(input.sender.lat, input.sender.lng)
  const destWh = await nearestWarehouse(input.receiver.lat, input.receiver.lng)

  const originRegion = regionOfProvinceOrCoords(originWh?.province || null, input.sender.lat)
  const destRegion = regionOfProvinceOrCoords(destWh?.province || null, input.receiver.lat)
  const withinProvince = originWh?.province === destWh?.province

  const { fee } = await calculateShippingFee({
    originRegion,
    destinationRegion: destRegion,
    withinProvince: !!withinProvince,
    weightKg: input.weightKg,
  })

  const tracking = await nextTrackingCode()
  const statusCreatedId = await getStatusIdByCode('created')

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query(
      `INSERT INTO orders (
        tracking_code, customer_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
        sender_name, sender_phone, sender_address, sender_lat, sender_lng,
        receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
        weight_kg, shipping_fee, total_amount, current_status_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        tracking,
        input.customerId,
        originWh?.id || null,
        destWh?.id || null,
        originWh?.id || null,
        input.sender.name,
        input.sender.phone,
        input.sender.address,
        input.sender.lat,
        input.sender.lng,
        input.receiver.name,
        input.receiver.phone,
        input.receiver.address,
        input.receiver.lat,
        input.receiver.lng,
        input.weightKg,
        fee,
        fee,
        statusCreatedId,
      ]
    )
    // @ts-ignore
    const orderId = result.insertId as number

    await conn.query(
      'INSERT INTO order_status_history (order_id, order_status_id, note, warehouse_id) VALUES (?,?,?,?)',
      [orderId, statusCreatedId, 'Đơn hàng vừa được tạo', originWh?.id || null]
    )
    await conn.commit()

    const order = await getOrderById(orderId)
    return order
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function nextTrackingCode() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const prefix = `VN${y}${m}${d}`
  const [rows] = await pool.query(
    'SELECT tracking_code FROM orders WHERE tracking_code LIKE ? ORDER BY tracking_code DESC LIMIT 1',
    [`${prefix}-%`]
  )
  const res = rows as any[]
  let seq = 1
  if (res[0]) {
    const last = res[0].tracking_code as string
    const num = parseInt(last.split('-')[1] || '0', 10)
    seq = num + 1
  }
  return `${prefix}-${String(seq).padStart(4, '0')}`
}

export async function getOrderById(id: number) {
  const [rows] = await pool.query(
    `SELECT o.*, s.code AS current_status
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     WHERE o.order_id = ? LIMIT 1`,
    [id]
  )
  const res = rows as any[]
  if (!res[0]) return null
  const [hist] = await pool.query(
    `SELECT h.order_status_history_id, h.order_id, st.code AS status, h.note, h.warehouse_id, h.created_at
     FROM order_status_history h
     JOIN order_statuses st ON st.order_status_id = h.order_status_id
     WHERE h.order_id = ?
     ORDER BY h.created_at ASC`,
    [id]
  )
  return { ...res[0], history: hist }
}

export async function getOrderByTracking(tracking: string) {
  const [rows] = await pool.query(
    `SELECT o.*, s.code AS current_status
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     WHERE o.tracking_code = ? LIMIT 1`,
    [tracking]
  )
  const res = rows as any[]
  if (!res[0]) return null
  const orderId = res[0].order_id
  const [hist] = await pool.query(
    `SELECT h.order_status_history_id, h.order_id, st.code AS status, h.note, h.warehouse_id, h.created_at
     FROM order_status_history h
     JOIN order_statuses st ON st.order_status_id = h.order_status_id
     WHERE h.order_id = ?
     ORDER BY h.created_at ASC`,
    [orderId]
  )
  return { ...res[0], history: hist }
}

export async function updateOrderStatus(params: {
  orderId: number
  status: OrderStatus
  note?: string
  warehouseId?: number | null
}) {
  const order = await getOrderById(params.orderId)
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 })
  const current: OrderStatus = order.current_status
  if (!AllowedTransitions[current].includes(params.status)) {
    throw Object.assign(new Error(`Invalid status transition: ${current} -> ${params.status}`), { status: 400 })
  }
  const newStatusId = await getStatusIdByCode(params.status)

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const updates: any[] = [newStatusId]
    let sql = 'UPDATE orders SET current_status_id = ?'
    if (params.warehouseId) {
      sql += ', current_warehouse_id = ?'
      updates.push(params.warehouseId)
    }
    if (params.status === 'delivered') {
      sql += ', delivered_at = NOW()'
    }
    sql += ' WHERE order_id = ?'
    updates.push(params.orderId)
    await conn.query(sql, updates)

    await conn.query(
      'INSERT INTO order_status_history (order_id, order_status_id, note, warehouse_id) VALUES (?,?,?,?)',
      [params.orderId, newStatusId, params.note || null, params.warehouseId || null]
    )
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function computeRouteForTracking(tracking: string) {
  const order = await getOrderByTracking(tracking)
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 })

  // Determine sorting hubs in each region
  const originHub = await nearestSortingHub(regionOfProvinceOrCoords(order.sender_address ?? null, Number(order.sender_lat)))
  const destHub = await nearestSortingHub(regionOfProvinceOrCoords(order.receiver_address ?? null, Number(order.receiver_lat)))

  const route: Array<{ lat: number; lng: number; label: string }> = []

  if (order.origin_warehouse_id) {
    const [rows] = await pool.query('SELECT name, lat, lng FROM warehouses WHERE warehouse_id = ?', [order.origin_warehouse_id])
    const w = (rows as any[])[0]
    if (w) route.push({ lat: Number(w.lat), lng: Number(w.lng), label: w.name })
  }
  if (originHub) route.push({ lat: Number(originHub.lat), lng: Number(originHub.lng), label: originHub.name })
  if (destHub) route.push({ lat: Number(destHub.lat), lng: Number(destHub.lng), label: destHub.name })
  if (order.destination_warehouse_id) {
    const [rows2] = await pool.query('SELECT name, lat, lng FROM warehouses WHERE warehouse_id = ?', [order.destination_warehouse_id])
    const w2 = (rows2 as any[])[0]
    if (w2) route.push({ lat: Number(w2.lat), lng: Number(w2.lng), label: w2.name })
  }

  // current warehouse details
  let currentWarehouse = null as null | { lat: number; lng: number; name: string }
  if (order.current_warehouse_id) {
    const [rows3] = await pool.query('SELECT name, lat, lng FROM warehouses WHERE warehouse_id = ?', [order.current_warehouse_id])
    const w3 = (rows3 as any[])[0]
    if (w3) currentWarehouse = { lat: Number(w3.lat), lng: Number(w3.lng), name: w3.name }
  }

  return {
    sender: { lat: Number(order.sender_lat), lng: Number(order.sender_lng) },
    receiver: { lat: Number(order.receiver_lat), lng: Number(order.receiver_lng) },
    currentWarehouse,
    route,
  }
}
