import mongoose from "mongoose";
import { Order } from "@/app/src/models/Order";
import { Product } from "@/app/src/models/Product";
import { AppError } from "@/app/src/lib/appError";
import { Cart } from "@/app/src/models/Cart";
import { api } from "@/app/src/lib/api";

export const createOrder = async (data: {
    deliveryAddress: string;
}) => {
    const res = await api.post("/protected/order", data);
    return res.data;
};
export class OrderService {
    static async createOrder(userId: string, deliveryAddress: string) {
        const session = await mongoose.startSession();

        try {
            let createdOrder: any;

            await session.withTransaction(async () => {

                // 🛒 Fetch cart
                const cart = await Cart.findOne({ user: userId })
                    .populate("items.product")
                    .session(session);

                if (!cart || cart.items.length === 0) {
                    throw new AppError("Cart is empty", 400, "EMPTY_CART");
                }

                let totalAmount = 0;
                const orderItems: any[] = [];

                // 🔍 Validate + prepare items
                for (const item of cart.items) {
                    const product: any = item.product;

                    if (!product || !product.isAvailable) {
                        throw new AppError(
                            `Product unavailable: ${product?.name}`,
                            400,
                            "PRODUCT_UNAVAILABLE"
                        );
                    }

                    if (product.stock < item.quantity) {
                        throw new AppError(
                            `Insufficient stock for ${product.name}`,
                            400,
                            "INSUFFICIENT_STOCK"
                        );
                    }

                    totalAmount += product.price * item.quantity;

                    orderItems.push({
                        product: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity,
                    });
                }

                // 📦 Create order
                const order = await Order.create(
                    [
                        {
                            user: userId,
                            items: orderItems,
                            totalAmount,
                            deliveryAddress,
                            orderStatus: "PLACED",
                            statusHistory: [
                                {
                                    status: "PLACED",
                                    updatedAt: new Date(),
                                },
                            ],
                        },
                    ],
                    { session }
                );

                // 🔄 Deduct stock
                for (const item of cart.items) {
                    await Product.findByIdAndUpdate(
                        item.product._id,
                        { $inc: { stock: -item.quantity } },
                        { session }
                    );
                }

                // 🧹 Clear cart
                await Cart.findOneAndUpdate(
                    { user: userId },
                    { $set: { items: [] } },
                    { session }
                );

                createdOrder = order[0];
            });

            return createdOrder;

        } finally {
            session.endSession();
        }
    }
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