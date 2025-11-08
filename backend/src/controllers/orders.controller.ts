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
    `SELECT o.order_id,
            o.tracking_code,
            s.code AS current_status,
            o.sender_lat,
            o.sender_lng,
            o.receiver_lat,
            o.receiver_lng,
            o.origin_warehouse_id,
            o.destination_warehouse_id,
            o.current_warehouse_id,
            ow.name  AS origin_warehouse_name,
            ow.region AS origin_warehouse_region,
            dw.name  AS destination_warehouse_name,
            dw.region AS destination_warehouse_region,
            cw.name AS current_warehouse_name,
            cw.is_sorting_hub,
            o.created_at,
            o.shipper_user_id
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     LEFT JOIN warehouses ow ON ow.warehouse_id = o.origin_warehouse_id
     LEFT JOIN warehouses dw ON dw.warehouse_id = o.destination_warehouse_id
     LEFT JOIN warehouses cw ON cw.warehouse_id = o.current_warehouse_id
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

export async function assignShipperHandler(req: Request, res: Response) {
  const orderId = Number(req.params.id)
  const { shipper_user_id } = req.body || {}
  if (!orderId || !shipper_user_id) return res.status(400).json({ error: 'Missing orderId or shipper_user_id' })

  // Validate order exists
  const [orderRows] = await pool.query('SELECT order_id, shipper_user_id FROM orders WHERE order_id = ? LIMIT 1', [orderId])
  const orderRow = (orderRows as any[])[0]
  if (!orderRow) return res.status(404).json({ error: 'Order not found' })

  // Enforce single shipper per order unless same shipper or forced by admin
  const alreadyAssigned = orderRow.shipper_user_id as number | null
  const isSame = alreadyAssigned && Number(alreadyAssigned) === Number(shipper_user_id)
  const force = String(req.query.force || '').toLowerCase() === '1'
  if (alreadyAssigned && !isSame && !force) {
    return res.status(409).json({ error: 'Order already assigned to a shipper' })
  }

  // Validate shipper
  const [shipperRows] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ? LIMIT 1', [shipper_user_id])
  const shipper = (shipperRows as any[])[0]
  if (!shipper || shipper.role !== 'shipper') return res.status(400).json({ error: 'Invalid shipper' })

  // Upsert assignment and update order
  await pool.query('UPDATE orders SET shipper_user_id = ? WHERE order_id = ?', [shipper_user_id, orderId])
  await pool.query(
    `INSERT INTO order_assignments (order_id, shipper_user_id, assigned_by_user_id)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE shipper_user_id = VALUES(shipper_user_id), assigned_by_user_id = VALUES(assigned_by_user_id), assigned_at = NOW()`,
    [orderId, shipper_user_id, req.user!.id]
  )

  const order = await getOrderById(orderId)
  res.json(order)
}

export async function listByCustomerMeHandler(req: Request, res: Response) {
  const customerId = req.user!.id
  const [rows] = await pool.query(
    `SELECT o.order_id, o.tracking_code, s.code AS current_status,
            o.sender_name, o.created_at, o.shipping_fee, o.total_amount
     FROM orders o
     JOIN order_statuses s ON s.order_status_id = o.current_status_id
     WHERE o.customer_user_id = ?
     ORDER BY o.created_at DESC
     LIMIT 500`,
    [customerId]
  )
  res.json(rows)
}
