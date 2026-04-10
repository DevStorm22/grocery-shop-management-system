import mongoose from "mongoose";
import { Order } from "@/app/src/models/Order";
import { Product } from "@/app/src/models/Product";
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
    static async cancelOrder(orderId: string, userId: string) {
        const session = await mongoose.startSession();

        try {
            let updatedOrder: any;

            await session.withTransaction(async () => {

                const order = await Order.findById(orderId).session(session);

                if (!order) {
                    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
                }

                if (order.user.toString() !== userId) {
                    throw new AppError("Forbidden", 403, "FORBIDDEN");
                }

                const allowedCancelStates = ["PLACED", "CONFIRMED"];

                if (!allowedCancelStates.includes(order.orderStatus)) {
                    throw new AppError(
                        `Cannot cancel order in ${order.orderStatus} state`,
                        400,
                        "INVALID_STATE"
                    );
                }

                if (order.orderStatus === "CANCELLED") {
                    throw new AppError(
                        "Order already cancelled",
                        400,
                        "ALREADY_CANCELLED"
                    );
                }

                // 🔄 Restore stock
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } },
                        { session }
                    );
                }

                // 🔁 Update order
                order.orderStatus = "CANCELLED";

                order.statusHistory = order.statusHistory || [];
                order.statusHistory.push({
                    status: "CANCELLED",
                    updatedAt: new Date(),
                });

                await order.save({ session });

                updatedOrder = order;
            });

            return updatedOrder;

        } finally {
            session.endSession();
        }
    }
}