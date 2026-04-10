import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Cart } from "@/app/src/models/Cart";
import { Product } from "@/app/src/models/Product";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";
import { createOrderSchema } from "@/app/src/validations/order.validation";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export async function POST(req: Request) {
    try {
        await connectDB();
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }
        const token = authHeader.split(" ")[1];
        const decoded: any = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }
        const userId = decoded.userId;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return errorResponse("Cart is empty", 400, "EMPTY_CART");
        }
        let totalAmount = 0;
        const orderItems: any[] = [];
        for (const item of cart.items) {
            const product: any = item.product;
            if (!product || !product.isAvailable) {
                return errorResponse(
                    `Product unavailable: ${product?.name}`,
                    400,
                    "PRODUCT_UNAVAILABLE"
                );
            }
            if (product.stock < item.quantity) {
                return errorResponse(
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
        const body = await req.json();

        const parsed = createOrderSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation failed", 400, "VALIDATION_ERROR");
        }

        const { deliveryAddress } = parsed.data;

        const session = await mongoose.startSession();

        let order: any[] = [];

        await session.withTransaction(async () => {
            // 🧾 Create order
            order = await Order.create(
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

            // 📦 Reduce stock
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }

            // 🛒 Clear cart
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { items: [] } },
                { session }
            );
        });

        session.endSession();
        return successResponse(
            "Order placed successfully",
            { order: order[0] },
            201
        );
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error.message || "SERVER_ERROR"
        );
    }
}

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
