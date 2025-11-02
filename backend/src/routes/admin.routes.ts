import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { listUsersHandler, analyticsHandler } from '../controllers/admin.controller'

const router = Router()

router.use(requireAuth, requireRole('admin'))
router.get('/users', listUsersHandler)
router.get('/analytics', analyticsHandler)

export default router

