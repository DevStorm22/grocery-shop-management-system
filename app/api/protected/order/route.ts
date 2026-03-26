import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Cart } from "@/app/src/models/Cart";
import { Product } from "@/app/src/models/Product";
import { Order } from "@/app/src/models/Order";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { status: 401, message: "Invalid token" },
                { status: 401 }
            );
        }
        const userId = decoded.userId;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return NextResponse.json(
                { status: 400, message: "Cart is empty" },
                { status: 400 }
            );
        }
        let totalAmount = 0;
        const orderItems: any[] = [];
        for (const item of cart.items) {
            const product: any = item.product;
            if (!product || !product.isAvailable) {
                return NextResponse.json(
                    { status: 400, message: `Product unavailable: ${product?.name}` },
                    { status: 400 }
                );
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    {
                        status: 400,
                        message: `Insufficient stock for ${product.name}`,
                    },
                    { status: 400 }
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
        const { paymentMethod, deliveryAddress } = await req.json();
        if (!paymentMethod || !deliveryAddress) {
            return NextResponse.json(
                { status: 400, message: "Payment method & address required" },
                { status: 400 }
            );
        }
        const order = await Order.create(
            {
                user: userId,
                items: orderItems,
                totalAmount,
                paymentMethod,
                deliveryAddress,
                status: "PLACED",
            }
        );
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity },});
        }
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } }
        );
        return NextResponse.json(
            {status: 201,message: "Order placed successfully",order,},
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {status: 500,message: "Internal server error",error,},
            { status: 500 }
        );
    }
}

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
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
            { status: 401, message: "Invalid token" },
            { status: 401 }
            );
        }
        const userId = decoded.userId;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json(
            {status: 200,message: "User orders fetched",orders,},
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {status: 500, message: "Internal server error", error, },
            { status: 500, },
        );
    }
}
export async function PUT(req: Request) {
    try {
        await connectDB();
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        return NextResponse.json(
            {status: 200,message: "All orders fetched",orders,},
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {status: 500,message: "Internal server error",error,},
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
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
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { status: 401, message: "Invalid token" },
                { status: 401 }
            );
        }
        const { orderId, status } = await req.json();
        if (!orderId || !status) {
            return NextResponse.json(
                { status: 400, message: "orderId and status required" },
                { status: 400 }
            );
        }
        let allowedStatuses=["PLACED","CONFIRMED","SHIPPED","DELIVERED","CANCELLED",];
        if(status === "PLACED") {
            allowedStatuses=["CONFIRMED","SHIPPED","DELIVERED","CANCELLED",];
        }
        if(status === "CONFIRMED") {
            allowedStatuses=["SHIPPED","DELIVERED","CANCELLED",];
        }
        if(status === "SHIPPED") {
            allowedStatuses=["DELIVERED",];
        }
        if(status === "DELIVERED") {
            allowedStatuses = ["",];
        }
        
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json(
                { status: 400, message: "Invalid order status" },
                { status: 400 }
            );
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { status: 404, message: "Order not found" },
                { status: 404 }
            );
        }
        order.orderStatus = status;
        await order.save();
            return NextResponse.json(
                {status: 200,message: "Order status updated",order,},
                { status: 200 }
            );
        } catch (error) {
        return NextResponse.json(
            {status: 500,message: "Internal server error",error,},
            {status: 500}
        );
    }
}