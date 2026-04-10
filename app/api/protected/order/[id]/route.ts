import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";
import { orderIdSchema } from "@/app/src/validations/order.validation";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const parsed = orderIdSchema.safeParse({ id });

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid order ID",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validId = parsed.data.id;

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) {
      return errorResponse("Invalid token", 401, "INVALID_TOKEN");
    }

    const order = await Order.findById(validId).populate("items.product");

    if (!order) {
      return errorResponse("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (order.user.toString() !== decoded.userId) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    return successResponse("Order details fetched", { order });

  } catch (error: any) {
    return errorResponse(
      "Internal server error",
      500,
      error.message || "SERVER_ERROR"
    );
  }
}