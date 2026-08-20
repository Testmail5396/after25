export type {
  OrderInput,
  OrderRecord,
  PurchaseInput,
  PurchaseRecord,
  ProductRateInput,
  ProductRateRecord,
  Backup,
  LoginInput,
} from "./schemas";

export type ProductCategory = "Cake" | "Brownie" | "Cupcake" | "Biscuits" | "Bento Cake";
export type QuantityUnit = "kg" | "g" | "pcs";
export type RateUnit = "kg" | "pcs";
export type Occasion = "Birthday" | "Anniversary" | "Other" | "None";
export type PaymentStatus = "Paid" | "Partial" | "Pending";
export type PurchaseCategory = "Baking Essentials" | "General Groceries";

export type DateRangePreset =
  | "last7days"
  | "thisMonth"
  | "last6months"
  | "last1year"
  | "custom";

export interface DateRange {
  start: string; // yyyy-MM-dd, inclusive
  end: string; // yyyy-MM-dd, inclusive
}

export interface TrendPoint {
  label: string;
  bucketStart: string;
  sales: number;
  purchases: number;
}

export interface CategoryRevenue {
  category: ProductCategory;
  revenue: number;
}

export interface CustomerSummary {
  key: string; // normalized phone number
  name: string;
  phoneNumber: string; // last-seen, original (unnormalized) display value
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  cakeSpent: number;
  brownieSpent: number;
}

export interface ReminderItem {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  occasion: "Birthday" | "Anniversary";
  occasionDate: string;
  nextOccurrence: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface DashboardMetrics {
  totalSales: number;
  totalPurchases: number;
  netCashBalance: number;
  cakeSales: number;
  brownieSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface AuthUser {
  username: string;
}
