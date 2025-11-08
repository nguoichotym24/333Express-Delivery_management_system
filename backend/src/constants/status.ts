export type OrderStatus =
  | 'created'
  | 'waiting_for_pickup'
  | 'picked_up'
  | 'arrived_at_origin_hub'
  | 'in_transit_to_sorting_center'
  | 'arrived_at_sorting_hub'
  | 'in_transit_to_destination_hub'
  | 'arrived_at_destination_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'returned_to_destination_hub'
  | 'return_in_transit'
  | 'returned_to_origin'
  | 'cancelled'
  | 'lost'

export const AllowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  created: ['waiting_for_pickup', 'cancelled'],
  waiting_for_pickup: ['picked_up', 'arrived_at_origin_hub', 'arrived_at_destination_hub', 'cancelled'],
  picked_up: ['arrived_at_origin_hub', 'arrived_at_destination_hub'],
  arrived_at_origin_hub: ['in_transit_to_sorting_center', 'in_transit_to_destination_hub'],
  in_transit_to_sorting_center: ['arrived_at_sorting_hub'],
  arrived_at_sorting_hub: ['in_transit_to_destination_hub', 'return_in_transit'],
  in_transit_to_destination_hub: ['arrived_at_destination_hub'],
  arrived_at_destination_hub: ['out_for_delivery', 'return_in_transit'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivered: [],
  delivery_failed: ['returned_to_destination_hub'],
  returned_to_destination_hub: ['return_in_transit'],
  return_in_transit: ['returned_to_origin'],
  returned_to_origin: [],
  cancelled: [],
  lost: [],
}
