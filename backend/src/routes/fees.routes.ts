import { Router } from 'express'
import { calculateFeeHandler } from '../controllers/fees.controller'

const router = Router()

router.get('/calculate', calculateFeeHandler)

export default router

