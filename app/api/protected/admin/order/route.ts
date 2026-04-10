import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";
import { paginationSchema } from "@/app/src/validations/order.validation";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export async function GET(req: Request) {
    try {
        await connectDB();
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }

        const token = authHeader.split(" ")[1];
        const decoded: any = verifyToken(token);

        if (!decoded || decoded.role !== "admin") {
            return errorResponse("Admin only access", 403, "FORBIDDEN");
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
            return errorResponse("Invalid pagination params", 400, "VALIDATION_ERROR");
        }

        const { page, limit } = parsedQuery.data;
        // Optional status (controlled manually)
        const status = searchParams.get("status");
        const allowedStatus = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

        if (status && !allowedStatus.includes(status)) {
            return errorResponse("Invalid status filter", 400, "INVALID_STATUS");
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

        return successResponse("Admin orders fetched", {
            orders,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error.message || "SERVER_ERROR"
        );
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();

        // 🔐 Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return errorResponse("Invalid token", 401, "INVALID_TOKEN");
        }

        // 🔒 RBAC
        if (decoded.role !== "admin") {
            return errorResponse(
                "Only admin can update order status",
                403,
                "FORBIDDEN"
            );
        }

        // 📦 Body
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return errorResponse(
                "orderId and status required",
                400,
                "VALIDATION_ERROR"
            );
        }

        // 🔍 Find Order
        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse("Order not found", 404, "ORDER_NOT_FOUND");
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
            return errorResponse(
                `Cannot change status from ${currentStatus} to ${status}`,
                400,
                "INVALID_ORDER_TRANSITION"
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

        return successResponse(
            "Order status updated successfully",
            { order }
        );
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error.message || "SERVER_ERROR"
        );
    }
}