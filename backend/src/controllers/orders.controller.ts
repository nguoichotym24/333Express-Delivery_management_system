import { Request, Response } from 'express'
import { createOrder, getOrderById, getOrderByTracking, updateOrderStatus, computeRouteForTracking } from '../services/orders.service'

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

