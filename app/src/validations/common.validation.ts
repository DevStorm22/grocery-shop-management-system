import { z } from "zod";

/**
 * 🔑 Mongo ObjectId validation
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

/**
 * 📄 Pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .refine((val) => val > 0, {
      message: "Page must be greater than 0",
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

/**
 * 📦 Order status enum (centralized)
 */
export const orderStatusEnum = z.enum([
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

/**
 * 💳 Payment status enum
 */
export const paymentStatusEnum = z.enum([
  "PENDING",
  "PAID",
]);

/**
 * 📍 Address validation
 */
export const addressSchema = z
  .string()
  .min(5, "Address too short")
  .max(255, "Address too long");