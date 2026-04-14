import { NextResponse } from "next/server";
import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await context.params;
        const body = await req.json();

        const { type, value } = body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid product id",
                },
                { status: 400 }
            );
        }

        const amount = Number(value || 0);

        const update =
            type === "increase"
                ? { $inc: { stock: amount } }
                : { $inc: { stock: -amount } };

        let product = await Product.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        if (!product) {
            return NextResponse.json(
                {
                    status: 404,
                    message: "Product not found",
                },
                { status: 404 }
            );
        }

        if (product.stock <= 0) {
            product.stock = 0;
            product.isAvailable = false;
            await product.save();
        } else {
            product.isAvailable = true;
            await product.save();
        }

        return NextResponse.json({
            status: 200,
            message: "Stock updated",
            product,
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message: "Stock update failed",
            },
            { status: 500 }
        );
    }
}