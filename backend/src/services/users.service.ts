import { pool } from '../db/pool'
import { hashPassword } from '../utils/password'

export async function findUserByEmail(email: string) {
  const [rows] = await pool.query(
    'SELECT user_id AS id, email, password_hash, name, role, phone, address, warehouse_id FROM users WHERE email = ? LIMIT 1',
    [email]
  )
  const res = rows as any[]
  return res[0] || null
}

export async function createUser(input: {
  email: string
  password: string
  name: string
  role?: 'customer' | 'warehouse' | 'shipper' | 'admin'
  phone?: string
  address?: string
  warehouse_id?: number | null
}) {
  const password_hash = await hashPassword(input.password)
  const role = input.role || 'customer'
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id) VALUES (?,?,?,?,?,?,?)',
    [input.email, password_hash, input.name, role, input.phone || null, input.address || null, input.warehouse_id || null]
  )
  // @ts-ignore
  const id = result.insertId as number
  const [rows] = await pool.query(
    'SELECT user_id AS id, email, name, role, phone, address, warehouse_id FROM users WHERE user_id = ?',
    [id]
  )
  const res = rows as any[]
  return res[0]
}
