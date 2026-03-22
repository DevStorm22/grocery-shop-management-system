import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context : { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;
        console.log(id);
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { status: 400, message: "Invalid product id", },
                { status: 400, },
            );
        }
        const product = await Product.findById(id);
        if(!product) {
            return NextResponse.json(
                { status: 404, message: "Product not found", },
                { status: 404, },
            );
        }
        return NextResponse.json(
            { status: 200, message: "Product found!!!", product, },
            { status: 200, },
        )
    } catch (error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error },
            { status: 500, },
        );
    }
}