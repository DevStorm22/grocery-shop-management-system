import { Order } from "@/app/src/models/Order";

export class OrderService {
    static async getOrderById(orderId: string, userId: string) {
        const order = await Order.findById(orderId).populate("items.product");

        if (!order) {
            throw new Error("ORDER_NOT_FOUND");
        }

        if (order.user.toString() !== userId) {
            throw new Error("FORBIDDEN");
        }

        return order;
    }
}