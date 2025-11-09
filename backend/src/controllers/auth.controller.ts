import { Request, Response } from 'express'
import { findUserByEmail, createUser } from '../services/users.service'
import { verifyPassword } from '../utils/password'
import { generateToken } from '../middleware/auth'
import { pool } from '../db/pool'
import { hashPassword } from '../utils/password'

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string }
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const user = await findUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = generateToken({ id: user.id, email: user.email, role: user.role })
  const { password_hash, ...publicUser } = user
  res.json({ token, user: publicUser })
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone, address } = req.body || {}
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  const exists = await findUserByEmail(email)
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const user = await createUser({ email, password, name, phone, address })
  res.status(201).json(user)
}

export async function me(req: Request, res: Response) {
  const id = req.user!.id
  const [rows] = await pool.query(
    'SELECT user_id AS id, email, name, role, phone, address, warehouse_id FROM users WHERE user_id = ? LIMIT 1',
    [id]
  )
  const user = (rows as any[])[0]
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
}

export async function updateMe(req: Request, res: Response) {
  const id = req.user!.id
  const { name, phone, address, password } = req.body || {}
  const fields: string[] = []
  const values: any[] = []
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
  if (address !== undefined) { fields.push('address = ?'); values.push(address) }
  if (password) {
    const ph = await hashPassword(password)
    fields.push('password_hash = ?')
    values.push(ph)
  }
  if (fields.length === 0) return res.status(400).json({ error: 'No changes' })
  values.push(id)
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values)
  const [rows] = await pool.query(
    'SELECT user_id AS id, email, name, role, phone, address, warehouse_id FROM users WHERE user_id = ? LIMIT 1',
    [id]
  )
  const user = (rows as any[])[0]
  res.json(user)
}
