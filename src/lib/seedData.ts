import { addDays, subDays } from "date-fns";
import type { OrderInput, PurchaseInput } from "@shared/types";
import { formatDateOnly, todayDateOnly } from "./dateRange";

/** Sample data for local development only. Never invoked automatically or in production. */
export function buildSeedOrders(): OrderInput[] {
  const today = new Date();
  const upcomingBirthday = formatDateOnly(addDays(today, 10));

  return [
    {
      customerName: "Priya Kumar",
      phoneNumber: "9876543210",
      productCategory: "Cake",
      productName: "Chocolate Truffle Cake",
      quantity: 1,
      quantityUnit: "kg",
      totalAmount: 1200,
      saleDate: formatDateOnly(subDays(today, 2)),
      pickupOrDeliveryTime: "5:00 PM",
      occasion: "Birthday",
      occasionDate: upcomingBirthday,
      reminderEnabled: true,
    },
    {
      customerName: "Priya Kumar",
      phoneNumber: "98765 43210",
      productCategory: "Brownie",
      productName: "Fudge Brownie Box",
      quantity: 6,
      quantityUnit: "piece",
      totalAmount: 450,
      saleDate: formatDateOnly(subDays(today, 20)),
      pickupOrDeliveryTime: "11:00 AM",
      occasion: "None",
      occasionDate: null,
      reminderEnabled: false,
    },
    {
      customerName: "Arjun Menon",
      phoneNumber: "9123456780",
      productCategory: "Cake",
      productName: "Red Velvet Cake",
      quantity: 1.5,
      quantityUnit: "kg",
      totalAmount: 1800,
      saleDate: formatDateOnly(subDays(today, 5)),
      pickupOrDeliveryTime: "3:00 PM",
      occasion: "Anniversary",
      occasionDate: formatDateOnly(subDays(today, 200)),
      reminderEnabled: true,
    },
    {
      customerName: "Divya Rao",
      phoneNumber: "9988776655",
      productCategory: "Brownie",
      productName: "Walnut Brownie",
      quantity: 12,
      quantityUnit: "piece",
      totalAmount: 780,
      saleDate: formatDateOnly(subDays(today, 45)),
      pickupOrDeliveryTime: "6:30 PM",
      occasion: "Other",
      occasionDate: null,
      reminderEnabled: false,
    },
    {
      customerName: "Divya Rao",
      phoneNumber: "9988776655",
      productCategory: "Cake",
      productName: "Vanilla Birthday Cake",
      quantity: 1,
      quantityUnit: "kg",
      totalAmount: 950,
      saleDate: formatDateOnly(subDays(today, 90)),
      pickupOrDeliveryTime: "1:00 PM",
      occasion: "None",
      occasionDate: null,
      reminderEnabled: false,
    },
  ];
}

export function buildSeedPurchases(): PurchaseInput[] {
  const today = new Date();
  return [
    { purchaseDate: todayDateOnly(), totalAmount: 1500 },
    { purchaseDate: formatDateOnly(subDays(today, 10)), totalAmount: 2200 },
    { purchaseDate: formatDateOnly(subDays(today, 40)), totalAmount: 1800 },
  ];
}
