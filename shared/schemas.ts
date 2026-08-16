import { z } from "zod";

// Dates are stored as plain "yyyy-MM-dd" strings (no time/timezone component)
// to avoid off-by-one-day shifts caused by timezone conversion.
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-MM-dd format");

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().min(1));

export const productCategorySchema = z.enum(["Cake", "Brownie"]);
export const quantityUnitSchema = z.enum(["kg", "box", "piece"]);
export const occasionSchema = z.enum(["Birthday", "Anniversary", "Other", "None"]);

// ---- Purchases ----

export const purchaseInputSchema = z.object({
  purchaseDate: dateOnly,
  totalAmount: z.number().positive("Amount must be greater than zero"),
});
export type PurchaseInput = z.infer<typeof purchaseInputSchema>;

export const purchaseRecordSchema = purchaseInputSchema.extend({
  id: z.string(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});
export type PurchaseRecord = z.infer<typeof purchaseRecordSchema>;

// ---- Orders / Sales ----

export const orderInputSchema = z
  .object({
    customerName: z.string().trim().min(1, "Customer name is required").max(120),
    phoneNumber: z.string().trim().min(6, "Phone number is required").max(20),
    productCategory: productCategorySchema,
    productName: z.string().trim().min(1, "Product name is required").max(160),
    quantity: z.number().positive("Quantity must be greater than zero"),
    quantityUnit: quantityUnitSchema,
    totalAmount: z.number().positive("Amount must be greater than zero"),
    saleDate: dateOnly,
    pickupOrDeliveryTime: z.string().trim().max(60).optional().default(""),
    occasion: occasionSchema.default("None"),
    occasionDate: dateOnly.optional().nullable(),
    reminderEnabled: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if ((val.occasion === "Birthday" || val.occasion === "Anniversary") && !val.occasionDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Occasion date is required for Birthday or Anniversary",
        path: ["occasionDate"],
      });
    }
  });
export type OrderInput = z.infer<typeof orderInputSchema>;

export const orderRecordSchema = orderInputSchema.and(
  z.object({
    id: z.string(),
    reminderDismissedForYear: z.number().optional().nullable(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
  }),
);
export type OrderRecord = z.infer<typeof orderRecordSchema>;

// ---- Backup ----

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  orders: z.array(orderRecordSchema),
  purchases: z.array(purchaseRecordSchema),
});
export type Backup = z.infer<typeof backupSchema>;

// ---- Auth ----

export const loginInputSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;
