import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server"
import { successResponse, errorResponse } from "@/app/src/lib/apiResponse";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return errorResponse("Order not found", 404, "ORDER_NOT_FOUND");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return errorResponse("Order not found", 404, "ORDER_NOT_FOUND");
        }
        if (decoded.role !== "ADMIN") {
            return errorResponse(
                "Only admin can update order status",
                403,
                "FORBIDDEN"
            );
        }

        const body = await req.json();
        const { name, price, category, stock, description, image, unit } = body;
        if (!name || !price || !category) {
            return errorResponse(
                "orderId and status required",
                400,
                "VALIDATION_ERROR"
            );
        }
        await connectDB();
        const product = await Product.create(
            { name, price, category, stock, description, image, unit, },
        );
        return successResponse(
            "Product created successfully!!!",
            { productId: product._id },
            201,
        );
    } catch (error: any) {
        return errorResponse(
            "Internal server error",
            500,
            error.message || "SERVER_ERROR"
        );
    }
}