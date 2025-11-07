import { Router } from 'express'
import { listWarehousesHandler, listShippersByWarehouseHandler } from '../controllers/warehouses.controller'

const router = Router()

router.get('/', listWarehousesHandler)
router.get('/:id/shippers', listShippersByWarehouseHandler)

export default router
