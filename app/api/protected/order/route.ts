import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { OrderService } from "@/app/src/services/order.service";
import { asyncHandler } from "@/app/src/lib/asyncHandler";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";
import { createOrderSchema } from "@/app/src/validations/order.validation";

export const POST = asyncHandler(async (req: Request) => {
    await connectDB();

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

    // 📦 VALIDATION (ZOD)
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(
            parsed.error.errors[0].message,
            400,
            "VALIDATION_ERROR"
        );
    }

    const { deliveryAddress } = parsed.data;

    // 🧠 SERVICE CALL
    const order = await OrderService.createOrder(
        decoded.userId,
        deliveryAddress
    );

    return successResponse("Order placed successfully", { order }, 201);
});

export async function PUT(req: Request) {
    try {
        await connectDB();
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        return successResponse("All orders fetched", { orders });
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error.message || "SERVER_ERROR"
        );
    }
}
