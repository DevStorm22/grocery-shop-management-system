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
                { status: 401, message: "Unauthorized", },
                { status: 401, },
            );
        }
        const token = authHeader.split(" ")[1];
        const decoded: any = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { status: 401, message: "Invalid token", },
                { status: 401, },
            );
        }
        const userId = decoded.userId;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return NextResponse.json(
                { status: 400, message: "Cart is empty", },
                { status: 400, },
            );
        }
        let totalAmount = 0;
        const orderItems: any[] = [];
        for (const item of cart.items) {
            const product: any = item.product;
            if (!product || !product.isAvailable) {
                return NextResponse.json(
                    { status: 400, message: `Product unavailable: ${product?.name}`, },
                    { status: 400, },
                );
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { status: 400, message: `Insufficient stock for ${product.name}`, },
                    { status: 400, },
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
        const { deliveryAddress } = await req.json();
        if (!deliveryAddress) {
            return NextResponse.json(
                { status: 400, message: "Address required", },
                { status: 400, },
            );
        }
        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            orderStatus: "PLACED",   // ✅ correct
            statusHistory: [
              {
                status: "PLACED",
                updatedAt: new Date(),
              },
            ],
          });
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity },});
        }
        await Cart.findOneAndUpdate(
            { user: userId, },
            { $set: { items: [], }, }
        );
        return NextResponse.json(
            { status: 201, message: "Order placed successfully", order, },
            { status: 201, },
        );
    } catch (error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error, },
            { status: 500, },
        );
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
            { status: 401, message: "Unauthorized", },
            { status: 401, }
            );
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { status: 401, message: "Invalid token", },
                { status: 401, },
            );
        }
        const userId = decoded.userId;
        const orders = await Order.find();
        return NextResponse.json(
            { status: 200, message: "User orders fetched", orders, },
            { status: 200, },
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
            { status: 200, message: "All orders fetched", orders, },
            { status: 200, },
        );
    } catch (error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error, },
            { status: 500, },
        );
    }
}

export async function PATCH(req: Request) {
    try {
      await connectDB();
  
      // 🔐 Auth
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
  
      // 🔒 RBAC
      if (decoded.role !== "admin") {
        return NextResponse.json(
          { status: 403, message: "Only admin can update order status" },
          { status: 403 }
        );
      }
  
      // 📦 Body
      const { orderId, status } = await req.json();
  
      if (!orderId || !status) {
        return NextResponse.json(
          { status: 400, message: "orderId and status required" },
          { status: 400 }
        );
      }
  
      // 🔍 Find Order
      const order = await Order.findById(orderId);
  
      if (!order) {
        return NextResponse.json(
          { status: 404, message: "Order not found" },
          { status: 404 }
        );
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
        return NextResponse.json(
          { status: 400, message: `Cannot change status from ${currentStatus} to ${status}`, },
          { status: 400 }
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
  
      return NextResponse.json(
        {
          status: 200,
          message: "Order status updated successfully",
          order,
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          status: 500,
          message: "Internal server error",
          error: error.message || error.toString(),
        },
        { status: 500 }
      );
    }
  }