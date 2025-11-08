export const STATUS_LABELS: Record<string, string> = {
  created: "Người gửi đã tạo đơn",
  waiting_for_pickup: "Chờ lấy hàng",
  picked_up: "Đã lấy hàng",
  arrived_at_origin_hub: "Đã đến kho gửi",
  in_transit_to_sorting_center: "Đang đến kho trung tâm",
  arrived_at_sorting_hub: "Đã đến kho trung tâm",
  in_transit_to_destination_hub: "Đang đến kho đích",
  arrived_at_destination_hub: "Đã đến kho đích",
  out_for_delivery: "Đang giao hàng",
  delivered: "Giao hàng thành công",
  delivery_failed: "Giao hàng thất bại",
  returned_to_destination_hub: "Trả về kho đích",
  return_in_transit: "Đang hoàn hàng",
  returned_to_origin: "Đã hoàn về kho gốc",
  cancelled: "Đã hủy",
  lost: "Thất lạc",
}

export function statusLabel(code: string): string {
  return STATUS_LABELS[code] || code
}

