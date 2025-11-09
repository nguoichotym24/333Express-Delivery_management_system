import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { listUsersHandler, analyticsHandler, listFeeRulesHandler, usersCountHandler, createUserAdminHandler, updateUserAdminHandler, deleteUserAdminHandler, createFeeRuleHandler, updateFeeRuleHandler, deleteFeeRuleHandler, createWarehouseAdminHandler, updateWarehouseAdminHandler, deleteWarehouseAdminHandler, getUserAdminHandler } from '../controllers/admin.controller'

const router = Router()

router.use(requireAuth, requireRole('admin'))
router.get('/users', listUsersHandler)
router.get('/users/count', usersCountHandler)
router.get('/users/:id', getUserAdminHandler)
router.post('/users', createUserAdminHandler)
router.patch('/users/:id', updateUserAdminHandler)
router.delete('/users/:id', deleteUserAdminHandler)
router.get('/analytics', analyticsHandler)
router.get('/fee-rules', listFeeRulesHandler)
router.post('/fee-rules', createFeeRuleHandler)
router.patch('/fee-rules/:id', updateFeeRuleHandler)
router.delete('/fee-rules/:id', deleteFeeRuleHandler)
router.post('/warehouses', createWarehouseAdminHandler)
router.patch('/warehouses/:id', updateWarehouseAdminHandler)
router.delete('/warehouses/:id', deleteWarehouseAdminHandler)

export default router
