import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { orderIdSchema } from "@/app/src/validations/order.validation";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();

  let updatedOrder: any;

  try {
    await connectDB();

    const { id } = await context.params;

    // ✅ Zod validation
    const parsed = orderIdSchema.safeParse({ id });

    if (!parsed.success) {
      return errorResponse("Invalid order ID", 400, "INVALID_ORDER_ID");
    }

    const validId = parsed.data.id;

    // 🔐 AUTH
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) {
      return errorResponse("Invalid token", 401, "INVALID_TOKEN");
    }

    await session.withTransaction(async () => {
      const order = await Order.findById(validId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.user.toString() !== decoded.userId) {
        throw new Error("FORBIDDEN");
      }

      const allowedCancelStates = ["PLACED", "CONFIRMED"];

      if (!allowedCancelStates.includes(order.orderStatus)) {
        throw new Error(`INVALID_STATE_${order.orderStatus}`);
      }

      if (order.orderStatus === "CANCELLED") {
        throw new Error("ALREADY_CANCELLED");
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      // 🔁 Update order
      order.orderStatus = "CANCELLED";

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "CANCELLED",
        updatedAt: new Date(),
      });

      updatedOrder = await order.save({ session });
    });

    return successResponse(
      "Order cancelled successfully",
      { order: updatedOrder }
    );

  } catch (error: any) {
    session.endSession();

    if (error.message === "ORDER_NOT_FOUND") {
      return errorResponse("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (error.message === "FORBIDDEN") {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (error.message === "ALREADY_CANCELLED") {
      return errorResponse("Order already cancelled", 400, "ALREADY_CANCELLED");
    }

    if (error.message.startsWith("INVALID_STATE")) {
      return errorResponse(
        `Cannot cancel order in ${error.message.split("_")[2]} state`,
        400,
        "INVALID_ORDER_STATE"
      );
    }

    return successResponse(
      "Order cancelled successfully",
      { order: updatedOrder }
    );
  } finally {
    session.endSession();
  }
}