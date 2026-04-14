import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Order } from "@/app/src/models/Order";
import { paginationSchema } from "@/app/src/validations/order.validation";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";
import { NextResponse } from "next/server";

const ALLOWED_STATUS = [
    "PLACED",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

function getAdminFromRequest(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            {
                status: 401,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    if (!decoded) {
        return {
            error: errorResponse("Invalid token", 401, "INVALID_TOKEN"),
        };
    }
    if (decoded.role?.toString().toUpperCase() !== "ADMIN") {
        return {
            error: errorResponse(
                "Admin only access",
                403,
                "FORBIDDEN"
            ),
        };
    }
    return { decoded };
}
export async function GET(req: Request) {
    try {
        await connectDB();
        const auth = getAdminFromRequest(req);
        const { searchParams } = new URL(req.url);
        const rawQuery = {
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
        };
        const parsed = paginationSchema.safeParse(rawQuery);
        if (!parsed.success) {
            return errorResponse(
                "Invalid pagination params",
                400,
                "VALIDATION_ERROR"
            );
        }
        const { page, limit } = parsed.data;
        const status = searchParams.get("status");
        if (status && !ALLOWED_STATUS.includes(status)) {
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
        return successResponse(
            "Admin orders fetched",
            {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            }
        );
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error?.message ||
            "SERVER_ERROR"
        );
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const auth = getAdminFromRequest(req);
        const { orderId, status } = await req.json();
        if (!orderId || !status) {
            return errorResponse(
                "orderId and status required",
                400,
                "VALIDATION_ERROR"
            );
        }
        if (!ALLOWED_STATUS.includes(status)) {
            return errorResponse(
                "Invalid order status",
                400,
                "INVALID_STATUS"
            );
        }

        const order =
            await Order.findById(orderId);

        if (!order) {
            return errorResponse(
                "Order not found",
                404,
                "ORDER_NOT_FOUND"
            );
        }

        const currentStatus =
            order.orderStatus;

        const statusFlow: any = {
            PLACED: [
                "CONFIRMED",
                "CANCELLED",
            ],
            CONFIRMED: [
                "SHIPPED",
                "CANCELLED",
            ],
            SHIPPED: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };

        if (
            !statusFlow[
                currentStatus
            ]?.includes(status)
        ) {
            return errorResponse(
                `Cannot change status from ${currentStatus} to ${status}`,
                400,
                "INVALID_ORDER_TRANSITION"
            );
        }

        order.orderStatus = status;

        if (!order.statusHistory) {
            order.statusHistory = [];
        }

        order.statusHistory.push({
            status,
            updatedAt: new Date(),
        });

        if (
            status === "DELIVERED"
        ) {
            order.paymentStatus =
                "PAID";
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
            error?.message ||
            "SERVER_ERROR"
        );
    }
}