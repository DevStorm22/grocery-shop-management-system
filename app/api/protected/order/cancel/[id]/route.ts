import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { OrderService } from "@/app/src/services/order.service";
import { asyncHandler } from "@/app/src/lib/asyncHandler";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export const PATCH = asyncHandler(
  async (
    req: Request,
    context: { params: Promise<{ id: string }> }
  ) => {
    await connectDB();

    const { id } = await context.params;

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

    const order = await OrderService.cancelOrder(id, decoded.userId);

    return successResponse("Order cancelled successfully", { order });
  }
);