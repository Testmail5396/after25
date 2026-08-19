import type { OrderRecord, PurchaseRecord } from "@shared/types";

export function makeOrder(overrides: Partial<OrderRecord> = {}): OrderRecord {
  return {
    id: overrides.id ?? "order-1",
    customerName: "Priya Kumar",
    phoneNumber: "9876543210",
    productCategory: "Cake",
    productName: "Chocolate Truffle",
    quantity: 1,
    quantityUnit: "kg",
    totalAmount: 1000,
    saleDate: "2026-08-01",
    pickupOrDeliveryTime: "5:00 PM",
    occasion: "None",
    occasionDate: null,
    occasionNote: "",
    reminderEnabled: false,
    reminderDismissedForYear: null,
    paymentStatus: "Paid",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

export function makePurchase(overrides: Partial<PurchaseRecord> = {}): PurchaseRecord {
  return {
    id: overrides.id ?? "purchase-1",
    purchaseDate: "2026-08-01",
    totalAmount: 500,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}
