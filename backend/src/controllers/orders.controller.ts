import { Request, Response } from 'express'
import { createOrder, getOrderById, getOrderByTracking, updateOrderStatus, computeRouteForTracking } from '../services/orders.service'
import { pool } from '../db/pool'

export async function createOrderHandler(req: Request, res: Response) {
  const userId = req.user!.id
  const { sender, receiver, weightKg } = req.body || {}
  if (!sender || !receiver || !weightKg) return res.status(400).json({ error: 'Missing fields' })
  const order = await createOrder({ customerId: userId, sender, receiver, weightKg: Number(weightKg) })
  res.status(201).json(order)
}

export async function getOrderHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  const order = await getOrderById(id)
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
}

export async function publicTrackHandler(req: Request, res: Response) {
  const code = req.params.tracking
  const order = await getOrderByTracking(code)
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
}

export async function routeHandler(req: Request, res: Response) {
  const code = req.params.tracking
  const data = await computeRouteForTracking(code)
  res.json(data)
}

export async function updateStatusHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { status, note, warehouse_id } = req.body || {}
  if (!status) return res.status(400).json({ error: 'Missing status' })
  await updateOrderStatus({ orderId: id, status, note, warehouseId: warehouse_id ? Number(warehouse_id) : null })
  const order = await getOrderById(id)
  res.json(order)
}

export async function listByWarehouseHandler(req: Request, res: Response) {
  const warehouseId = Number(req.params.id)
  if (!warehouseId) return res.status(400).json({ error: 'Invalid warehouse id' })
  const [rows] = await pool.query(
    `SELECT o.order_id, o.tracking_code, s.code AS current_status,
            o.sender_lat, o.sender_lng, o.receiver_lat, o.receiver_lng,
            o.created_at
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     WHERE o.current_warehouse_id = ?
     ORDER BY o.created_at DESC
     LIMIT 200`,
    [warehouseId]
  )
  res.json(rows)
}

export async function listByShipperMeHandler(req: Request, res: Response) {
  const shipperId = req.user!.id
  const [rows] = await pool.query(
    `SELECT o.order_id, o.tracking_code, s.code AS current_status,
            o.sender_lat, o.sender_lng, o.receiver_lat, o.receiver_lng,
            o.created_at
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     WHERE o.shipper_user_id = ?
     ORDER BY o.created_at DESC
     LIMIT 200`,
    [shipperId]
  )
  res.json(rows)
}
