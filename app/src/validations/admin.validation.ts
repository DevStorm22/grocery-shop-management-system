import { z } from "zod";
import { objectIdSchema, orderStatusEnum } from "./common.validation";

export const updateOrderStatusSchema = z.object({
  orderId: objectIdSchema,
  status: orderStatusEnum,
});