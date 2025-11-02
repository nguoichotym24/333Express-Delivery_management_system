import { Router } from 'express'
import { listWarehousesHandler } from '../controllers/warehouses.controller'

const router = Router()

router.get('/', listWarehousesHandler)

export default router

