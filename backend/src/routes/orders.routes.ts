import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { createOrderHandler, getOrderHandler, publicTrackHandler, updateStatusHandler, routeHandler } from '../controllers/orders.controller'

const router = Router()

// public tracking
router.get('/public/track/:tracking', publicTrackHandler)
router.get('/:tracking/route', routeHandler)

// authenticated routes
router.post('/', requireAuth, requireRole('customer', 'admin'), createOrderHandler)
router.get('/:id', requireAuth, getOrderHandler)
router.patch('/:id/status', requireAuth, requireRole('warehouse', 'shipper', 'admin'), updateStatusHandler)

export default router

