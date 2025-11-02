import { Request, Response } from 'express'
import { findUserByEmail, createUser } from '../services/users.service'
import { verifyPassword } from '../utils/password'
import { generateToken } from '../middleware/auth'

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

