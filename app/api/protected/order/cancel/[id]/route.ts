import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    const { id } = await context.params;

    // 🔐 AUTH
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { status: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

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

      await order.save({ session });
    });

    session.endSession();

    return NextResponse.json(
      {
        status: 200,
        message: "Order cancelled successfully",
      },
      { status: 200 }
    );

  } catch (error: any) {
    session.endSession();

    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { status: 404, message: "Order not found" },
        { status: 404 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { status: 403, message: "Forbidden" },
        { status: 403 }
      );
    }

    if (error.message === "ALREADY_CANCELLED") {
      return NextResponse.json(
        { status: 400, message: "Order already cancelled" },
        { status: 400 }
      );
    }

    if (error.message.startsWith("INVALID_STATE")) {
      return NextResponse.json(
        {
          status: 400,
          message: `Cannot cancel order in ${error.message.split("_")[2]} state`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}