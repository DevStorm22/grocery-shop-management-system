import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { status: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    const order = await Order.findById(id).select(
      "user orderStatus statusHistory createdAt"
    );

    if (!order) {
      return NextResponse.json(
        { status: 404, message: "Order not found" },
        { status: 404 }
      );
    }

    const isOwner = order.user.toString() === decoded.userId;
    const isAdmin = decoded.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { status: 403, message: "Forbidden" },
        { status: 403 }
      );
    }

    let history = order.statusHistory || [];

    if (history.length === 0) {
      history = [
        {
          status: order.orderStatus,
          updatedAt: order.createdAt,
        },
      ];
    }

    history = history.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    return NextResponse.json(
      {
        status: 200,
        message: "Order history fetched",
        data: {
          orderId: order._id,
          currentStatus: order.orderStatus,
          history,
        },
      },
      { status: 200 }
    );
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