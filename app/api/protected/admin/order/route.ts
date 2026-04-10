import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";
import { paginationSchema } from "@/app/src/validations/order.validation";

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

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json(
                { status: 403, message: "Admin only access" },
                { status: 403 }
            );
        }

        // 📥 Query params
        const { searchParams } = new URL(req.url);

        const rawQuery = {
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
        };

        // ✅ Zod validation
        const parsedQuery = paginationSchema.safeParse(rawQuery);

        if (!parsedQuery.success) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid pagination params",
                    errors: parsedQuery.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { page, limit } = parsedQuery.data;
        // Optional status (controlled manually)
        const status = searchParams.get("status");
        const allowedStatus = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

        if (status && !allowedStatus.includes(status)) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid status filter",
                },
                { status: 400 }
            );
        }

        const filter: any = {};
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        return NextResponse.json(
            {
                status: 200,
                message: "Admin orders fetched",
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
                error: error.message,
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();

        // 🔐 Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { status: 401, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { status: 401, message: "Invalid token" },
                { status: 401 }
            );
        }

        // 🔒 RBAC
        if (decoded.role !== "admin") {
            return NextResponse.json(
                { status: 403, message: "Only admin can update order status" },
                { status: 403 }
            );
        }

        // 📦 Body
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json(
                { status: 400, message: "orderId and status required" },
                { status: 400 }
            );
        }

        // 🔍 Find Order
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { status: 404, message: "Order not found" },
                { status: 404 }
            );
        }

        if (!order.statusHistory) {
            order.statusHistory = [];
        }

        const currentStatus = order.orderStatus;

        // 🔁 Valid transitions map
        const statusFlow: any = {
            PLACED: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["SHIPPED", "CANCELLED"],
            SHIPPED: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };

        // ❌ Invalid transition
        if (!statusFlow[currentStatus].includes(status)) {
            return NextResponse.json(
                { status: 400, message: `Cannot change status from ${currentStatus} to ${status}`, },
                { status: 400 }
            );
        }

        // ✅ Update order
        order.orderStatus = status;

        order.statusHistory.push({
            status,
            updatedAt: new Date(),
        });

        // 💰 COD logic: mark paid on delivery
        if (status === "DELIVERED") {
            order.paymentStatus = "PAID";
        }

        await order.save();

        return NextResponse.json(
            {
                status: 200,
                message: "Order status updated successfully",
                order,
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