import { Router } from 'express'
import { login, register, me, updateMe } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, updateMe)

export default router
