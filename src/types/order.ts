export interface RecentOrder {
  orderId: string;
  externalOrderId: string;
  restaurantName: string;
  orderStatus: string;
  totalAmount: number;
  itemsSummary: string;
  placedAt: string;
}
