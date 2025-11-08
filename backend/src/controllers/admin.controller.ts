import { Request, Response } from 'express'
import { pool } from '../db/pool'
import { createUser } from '../services/users.service'
import { hashPassword } from '../utils/password'

export async function listUsersHandler(req: Request, res: Response) {
  const q = (req.query.q as string | undefined)?.trim() || ''
  const role = (req.query.role as string | undefined)?.trim() || ''
  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1), 100)
  const offset = (page - 1) * limit

  const params: any[] = []
  const where: string[] = []
  if (q) {
    where.push('(email LIKE ? OR name LIKE ? OR phone LIKE ?)')
    const like = `%${q}%`
    params.push(like, like, like)
  }
  if (role && role !== 'all') {
    where.push('role = ?')
    params.push(role)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereSql}`, params)
  const total = (countRows as any[])[0]?.total || 0

  const [rows] = await pool.query(
    `SELECT user_id AS id, email, name, role, phone, address, warehouse_id, created_at
     FROM users ${whereSql}
     ORDER BY created_at DESC, user_id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )
  res.json({ data: rows, total, page, limit })
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

export async function listFeeRulesHandler(_req: Request, res: Response) {
  const [rows] = await pool.query('SELECT shipping_fee_rule_id as id, name, from_region, to_region, within_province, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabled FROM shipping_fee_rules ORDER BY id DESC')
  res.json(rows)
}

const ALLOWED_REGIONS = new Set(['north', 'central', 'south'])

export async function createFeeRuleHandler(req: Request, res: Response) {
  try {
    const {
      name,
      from_region,
      to_region,
      within_province = 0,
      base_fee,
      base_weight_kg = 1.0,
      max_weight_kg = 50.0,
      extra_fee_per_kg = 0,
      enabled = 1,
    } = req.body || {}

    if (!name || base_fee == null) return res.status(400).json({ error: 'Missing required fields' })
    const within = Number(within_province) ? 1 : 0
    const enabledVal = Number(enabled) ? 1 : 0

    if (!within) {
      if (!ALLOWED_REGIONS.has(from_region) || !ALLOWED_REGIONS.has(to_region)) {
        return res.status(400).json({ error: 'Invalid region pair' })
      }
    }

    const [result] = await pool.query(
      `INSERT INTO shipping_fee_rules (name, from_region, to_region, within_province, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabled)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, within ? null : from_region || null, within ? null : to_region || null, within, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabledVal]
    )
    // @ts-ignore
    const id = result.insertId as number
    const [rows] = await pool.query(
      'SELECT shipping_fee_rule_id as id, name, from_region, to_region, within_province, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabled FROM shipping_fee_rules WHERE shipping_fee_rule_id = ?',
      [id]
    )
    const rule = (rows as any[])[0]
    return res.status(201).json(rule)
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateFeeRuleHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    const {
      name,
      from_region,
      to_region,
      within_province,
      base_fee,
      base_weight_kg,
      max_weight_kg,
      extra_fee_per_kg,
      enabled,
    } = req.body || {}

    const fields: string[] = []
    const values: any[] = []
    if (name !== undefined) { fields.push('name = ?'); values.push(name) }
    if (within_province !== undefined) {
      const within = Number(within_province) ? 1 : 0
      fields.push('within_province = ?'); values.push(within)
      if (within) {
        fields.push('from_region = NULL');
        fields.push('to_region = NULL');
      }
    }
    if (from_region !== undefined) {
      if (from_region !== null && !ALLOWED_REGIONS.has(from_region)) return res.status(400).json({ error: 'Invalid from_region' })
      fields.push('from_region = ?'); values.push(from_region)
    }
    if (to_region !== undefined) {
      if (to_region !== null && !ALLOWED_REGIONS.has(to_region)) return res.status(400).json({ error: 'Invalid to_region' })
      fields.push('to_region = ?'); values.push(to_region)
    }
    if (base_fee !== undefined) { fields.push('base_fee = ?'); values.push(base_fee) }
    if (base_weight_kg !== undefined) { fields.push('base_weight_kg = ?'); values.push(base_weight_kg) }
    if (max_weight_kg !== undefined) { fields.push('max_weight_kg = ?'); values.push(max_weight_kg) }
    if (extra_fee_per_kg !== undefined) { fields.push('extra_fee_per_kg = ?'); values.push(extra_fee_per_kg) }
    if (enabled !== undefined) { fields.push('enabled = ?'); values.push(Number(enabled) ? 1 : 0) }

    if (fields.length === 0) return res.status(400).json({ error: 'No changes' })
    values.push(id)
    await pool.query(`UPDATE shipping_fee_rules SET ${fields.join(', ')} WHERE shipping_fee_rule_id = ?`, values)
    const [rows] = await pool.query(
      'SELECT shipping_fee_rule_id as id, name, from_region, to_region, within_province, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabled FROM shipping_fee_rules WHERE shipping_fee_rule_id = ?',
      [id]
    )
    const rule = (rows as any[])[0]
    if (!rule) return res.status(404).json({ error: 'Not found' })
    return res.json(rule)
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteFeeRuleHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    await pool.query('DELETE FROM shipping_fee_rules WHERE shipping_fee_rule_id = ?', [id])
    return res.status(204).send()
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Users count + breakdown
export async function usersCountHandler(_req: Request, res: Response) {
  const [allRows] = await pool.query('SELECT COUNT(*) AS count FROM users')
  const [noWhRows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE warehouse_id IS NULL')
  const [withWhRows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE warehouse_id IS NOT NULL')
  const [byRole] = await pool.query('SELECT role, COUNT(*) AS count FROM users GROUP BY role')
  res.json({
    count: (allRows as any[])[0]?.count ?? 0,
    withoutWarehouse: (noWhRows as any[])[0]?.count ?? 0,
    withWarehouse: (withWhRows as any[])[0]?.count ?? 0,
    byRole,
  })
}

const ALLOWED_ROLES = new Set(['customer','warehouse','shipper','admin'])

export async function createUserAdminHandler(req: Request, res: Response) {
  try {
    const { email, name, role, phone, address, warehouse_id, password } = req.body || {}
    if (!email || !name) return res.status(400).json({ error: 'Missing email or name' })
    if (role && !ALLOWED_ROLES.has(role)) return res.status(400).json({ error: 'Invalid role' })
    if (warehouse_id != null) {
      const [wh] = await pool.query('SELECT warehouse_id FROM warehouses WHERE warehouse_id = ? LIMIT 1', [warehouse_id])
      if ((wh as any[]).length === 0) return res.status(400).json({ error: 'Invalid warehouse_id' })
    }
    const created = await createUser({
      email,
      name,
      role,
      phone,
      address,
      warehouse_id: warehouse_id ?? null,
      password: password || 'password123',
    })
    return res.status(201).json(created)
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateUserAdminHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid user id' })
    const { name, role, phone, address, warehouse_id, password } = req.body || {}
    if (role && !ALLOWED_ROLES.has(role)) return res.status(400).json({ error: 'Invalid role' })
    if (warehouse_id !== undefined && warehouse_id !== null) {
      const [wh] = await pool.query('SELECT warehouse_id FROM warehouses WHERE warehouse_id = ? LIMIT 1', [warehouse_id])
      if ((wh as any[]).length === 0) return res.status(400).json({ error: 'Invalid warehouse_id' })
    }

    const fields: string[] = []
    const values: any[] = []
    if (name !== undefined) { fields.push('name = ?'); values.push(name) }
    if (role !== undefined) { fields.push('role = ?'); values.push(role) }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
    if (address !== undefined) { fields.push('address = ?'); values.push(address) }
    if (warehouse_id !== undefined) { fields.push('warehouse_id = ?'); values.push(warehouse_id) }
    if (password) { const ph = await hashPassword(password); fields.push('password_hash = ?'); values.push(ph) }

    if (fields.length === 0) return res.status(400).json({ error: 'No changes' })

    values.push(id)
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values)
    const [rows] = await pool.query('SELECT user_id AS id, email, name, role, phone, address, warehouse_id FROM users WHERE user_id = ?', [id])
    const resRow = (rows as any[])[0]
    if (!resRow) return res.status(404).json({ error: 'User not found' })
    return res.json(resRow)
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteUserAdminHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid user id' })
    if (req.user?.id === id) return res.status(400).json({ error: 'Cannot delete yourself' })
    await pool.query('DELETE FROM users WHERE user_id = ?', [id])
    return res.status(204).send()
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
