import type { OrderRecord, PurchaseRecord } from "@shared/types";

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }
  return lines.join("\n");
}

export function ordersToCsv(orders: OrderRecord[]): string {
  const headers = [
    "Customer Name",
    "Phone Number",
    "Category",
    "Product",
    "Quantity",
    "Unit",
    "Amount",
    "Sale Date",
    "Pickup/Delivery Time",
    "Occasion",
    "Occasion Date",
  ];
  const rows = orders.map((o) => [
    o.customerName,
    o.phoneNumber,
    o.productCategory,
    o.productName,
    o.quantity,
    o.quantityUnit,
    o.totalAmount,
    o.saleDate,
    o.pickupOrDeliveryTime,
    o.occasion,
    o.occasionDate ?? "",
  ]);
  return toCsv(headers, rows);
}

export function purchasesToCsv(purchases: PurchaseRecord[]): string {
  const headers = ["Purchase Date", "Amount"];
  const rows = purchases.map((p) => [p.purchaseDate, p.totalAmount]);
  return toCsv(headers, rows);
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
