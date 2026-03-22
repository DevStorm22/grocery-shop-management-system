import { connectDB } from "@/app/src/lib/db"
import { Product } from "@/app/src/models/Product";
import { NextResponse } from "next/server"

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({ isAvailable: true });
        return NextResponse.json(
            { status: 200, productCount: products.length, products, },
            { status: 200 },
        );
    } catch(error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error: error },
            { status: 500 },
        );
    }
}