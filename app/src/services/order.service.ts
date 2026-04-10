import { Order } from "@/app/src/models/Order";
import { AppError } from "@/app/src/lib/appError";
export class OrderService {
    static async getOrderById(orderId: string, userId: string) {
        const order = await Order.findById(orderId).populate("items.product");

        if (!order) {
            throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
        }

        if (order.user.toString() !== userId) {
            throw new AppError("Forbidden", 403, "FORBIDDEN");
        }

        return order;
    }
}