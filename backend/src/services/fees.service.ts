import { pool } from '../db/pool'

export interface FeeInput {
  originRegion: 'north' | 'central' | 'south'
  destinationRegion: 'north' | 'central' | 'south'
  withinProvince: boolean
  weightKg: number
}

export async function calculateShippingFee(input: FeeInput): Promise<{ fee: number; ruleId: number | null }>
{
  const { originRegion, destinationRegion, withinProvince, weightKg } = input
  const [rows] = await pool.query(
    `SELECT shipping_fee_rule_id AS id, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg
     FROM shipping_fee_rules
     WHERE enabled = 1
       AND (within_province = ?)
       AND ( (within_province = 1) OR (from_region = ? AND to_region = ?) )
     ORDER BY within_province DESC LIMIT 1`,
    [withinProvince ? 1 : 0, originRegion, destinationRegion]
  )
  const res = rows as any[]
  if (!res[0]) {
    // fallback: flat fee
    return { fee: 30000, ruleId: null }
  }
  const rule = res[0]
  const base = Number(rule.base_fee)
  const baseW = Number(rule.base_weight_kg)
  const maxW = Number(rule.max_weight_kg)
  const extraPer = Number(rule.extra_fee_per_kg)

  const w = Math.min(weightKg, maxW)
  if (w <= baseW) return { fee: base, ruleId: rule.id }

  const extra = Math.ceil(w - baseW) * extraPer
  return { fee: base + extra, ruleId: rule.id }
}
