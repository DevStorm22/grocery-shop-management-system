import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

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

    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("items totalAmount orderStatus paymentStatus createdAt");

    const total = await Order.countDocuments({ user: userId });

    return NextResponse.json(
      {
        status: 200,
        message: "My orders fetched successfully",
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}