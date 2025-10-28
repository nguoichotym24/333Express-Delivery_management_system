export interface ShippingFeeConfig {
  domesticSameProvince: number // Nội tỉnh
  domesticOtherProvince: number // Liên tỉnh
  interRegion: number // Liên miền
  baseWeightLimit: number // kg
  additionalWeightFee: number // per kg
}

export const defaultShippingConfig: ShippingFeeConfig = {
  domesticSameProvince: 18000,
  domesticOtherProvince: 28000,
  interRegion: 35000,
  baseWeightLimit: 5,
  additionalWeightFee: 2000,
}

export function calculateShippingFee(
  region: "same_province" | "other_province" | "inter_region",
  weight: number,
  config: ShippingFeeConfig = defaultShippingConfig,
): number {
  let baseFee = 0

  switch (region) {
    case "same_province":
      baseFee = config.domesticSameProvince
      break
    case "other_province":
      baseFee = config.domesticOtherProvince
      break
    case "inter_region":
      baseFee = config.interRegion
      break
  }

  // Add extra fee for weight over base limit
  if (weight > config.baseWeightLimit) {
    const extraWeight = weight - config.baseWeightLimit
    const extraFee = Math.ceil(extraWeight) * config.additionalWeightFee
    return baseFee + extraFee
  }

  return baseFee
}
