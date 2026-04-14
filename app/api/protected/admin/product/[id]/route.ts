import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await context.params;

        const body = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid product Id",
                },
                { status: 400 }
            );
        }

        const updatedProduct =
            await Product.findByIdAndUpdate(
                id,
                body,
                { new: true }
            );

        if (!updatedProduct) {
            return NextResponse.json(
                {
                    status: 404,
                    message: "Product not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                status: 200,
                message:
                    "Product updated successfully",
                product: updatedProduct,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message:
                    "Internal Server Problem",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { status: 400, message: "Invalid product id", },
                { status: 400, },
            );
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json(
                { status: 404, message: "Product not found", },
                { status: 404, },
            );
        }
        return NextResponse.json(
            { status: 200, message: "Product deleted successfully", },
            { status: 200, },
        );
    } catch (error) {
        return NextResponse.json(
            { status: 500, message: "Internal server problem!!!", error, },
            { status: 500, },
        );
    }
}