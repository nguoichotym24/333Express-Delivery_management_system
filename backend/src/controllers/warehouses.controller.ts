import { Request, Response } from 'express'
import { listWarehouses } from '../services/warehouses.service'
import { pool } from '../db/pool'

export async function listWarehousesHandler(_req: Request, res: Response) {
  const rows = await listWarehouses()
  res.json(rows)
}

export async function listShippersByWarehouseHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'Invalid warehouse id' })
  const [rows] = await pool.query(
    `SELECT user_id as id, name, email, phone FROM users WHERE role = 'shipper' AND warehouse_id = ?`,
    [id]
  )
  res.json(rows)
}
