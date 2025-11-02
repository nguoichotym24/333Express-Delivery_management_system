import { Request, Response } from 'express'
import { listWarehouses } from '../services/warehouses.service'

export async function listWarehousesHandler(_req: Request, res: Response) {
  const rows = await listWarehouses()
  res.json(rows)
}

