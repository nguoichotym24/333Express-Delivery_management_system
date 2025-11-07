import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { createOrderHandler, getOrderHandler, publicTrackHandler, updateStatusHandler, routeHandler, listByWarehouseHandler, listByShipperMeHandler, assignShipperHandler, listByCustomerMeHandler } from '../controllers/orders.controller'

const router = Router()

// public tracking
router.get('/public/track/:tracking', publicTrackHandler)
router.get('/:tracking/route', routeHandler)

// authenticated routes
router.post('/', requireAuth, requireRole('customer', 'admin'), createOrderHandler)
router.get('/:id', requireAuth, getOrderHandler)
router.patch('/:id/status', requireAuth, requireRole('warehouse', 'shipper', 'admin'), updateStatusHandler)

// listings
router.get('/warehouse/:id', requireAuth, requireRole('warehouse', 'admin'), listByWarehouseHandler)
router.get('/shipper/me', requireAuth, requireRole('shipper', 'admin'), listByShipperMeHandler)
router.post('/:id/assign', requireAuth, requireRole('warehouse', 'admin'), assignShipperHandler)
router.get('/customer/me', requireAuth, requireRole('customer', 'admin'), listByCustomerMeHandler)

export default router
