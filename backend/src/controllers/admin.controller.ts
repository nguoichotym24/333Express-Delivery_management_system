import { Request, Response } from 'express'
import { pool } from '../db/pool'

export async function listUsersHandler(_req: Request, res: Response) {
  const [rows] = await pool.query('SELECT user_id AS id, email, name, role, phone, address, warehouse_id, created_at FROM users')
  res.json(rows)
}

export async function analyticsHandler(_req: Request, res: Response) {
  const [ordersCount] = await pool.query('SELECT COUNT(*) as count FROM orders')
  const [revenue] = await pool.query('SELECT COALESCE(SUM(o.shipping_fee),0) as revenue FROM orders o JOIN order_statuses s ON s.order_status_id = o.current_status_id WHERE s.code = "delivered"')
  const [byDay] = await pool.query(`
    SELECT DATE(created_at) as day, COUNT(*) as orders, SUM(shipping_fee) as revenue
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 14`)
  res.json({
    totals: (ordersCount as any[])[0],
    revenue: (revenue as any[])[0],
    byDay,
  })
}
