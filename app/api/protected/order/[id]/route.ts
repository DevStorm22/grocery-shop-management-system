import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";
import { orderIdSchema } from "@/app/src/validations/order.validation";

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

    const order = await Order.findById(validId).populate("items.product");

    if (!order) {
      return NextResponse.json(
        { status: 404, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { status: 403, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Order details fetched",
      order,
    });

  } catch (error: any) {
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