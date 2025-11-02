import { Request, Response } from 'express'
import { calculateShippingFee } from '../services/fees.service'
import { nearestWarehouse } from '../services/warehouses.service'

export async function calculateFeeHandler(req: Request, res: Response) {
  const { fromLat, fromLng, toLat, toLng, weightKg } = req.query
  if (!fromLat || !fromLng || !toLat || !toLng || !weightKg) {
    return res.status(400).json({ error: 'Missing params' })
  }
  const origin = await nearestWarehouse(Number(fromLat), Number(fromLng))
  const dest = await nearestWarehouse(Number(toLat), Number(toLng))
  const withinProvince = origin?.province === dest?.province
  const { fee } = await calculateShippingFee({
    originRegion: origin.region,
    destinationRegion: dest.region,
    withinProvince: !!withinProvince,
    weightKg: Number(weightKg),
  })
  res.json({ fee })
}

