import { z } from "zod";
import {
  objectIdSchema,
  paginationSchema,
  addressSchema,
} from "./common.validation";

export const createOrderSchema = z.object({
  deliveryAddress: addressSchema,
});

export const orderIdSchema = z.object({
  id: objectIdSchema,
});

export { paginationSchema };