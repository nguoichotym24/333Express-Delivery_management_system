import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { listUsersHandler, analyticsHandler, listFeeRulesHandler, usersCountHandler, createUserAdminHandler, updateUserAdminHandler, deleteUserAdminHandler } from '../controllers/admin.controller'

const router = Router()

router.use(requireAuth, requireRole('admin'))
router.get('/users', listUsersHandler)
router.get('/users/count', usersCountHandler)
router.post('/users', createUserAdminHandler)
router.patch('/users/:id', updateUserAdminHandler)
router.delete('/users/:id', deleteUserAdminHandler)
router.get('/analytics', analyticsHandler)
router.get('/fee-rules', listFeeRulesHandler)

export default router
