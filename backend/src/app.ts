import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { config } from './config/env'
import { errorHandler } from './middleware/error'
import authRoutes from './routes/auth.routes'
import orderRoutes from './routes/orders.routes'
import warehouseRoutes from './routes/warehouses.routes'
import feeRoutes from './routes/fees.routes'
import adminRoutes from './routes/admin.routes'

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors({ origin: config.corsOrigins }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/orders', orderRoutes)
app.use('/warehouses', warehouseRoutes)
app.use('/fees', feeRoutes)
app.use('/admin', adminRoutes)

app.use(errorHandler)

export default app

