import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if(!authHeader || !authHeader.startsWith("Bearer")) {
            return NextResponse.json(
                { status: 401, message: "Invalid token" },
                { status: 401 },
            );
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if(!decoded) {
            return NextResponse.json(
                { status: 401, message: "invalid Token" },
                { status: 401 },
            );
        }
        if(decoded.role !== "admin") {
            return NextResponse.json(
                { status: 403, message: "Only admin can access this!!" },
                { status: 403 },
            )
        }

        const body = await req.json();
        const { name, price, category, stock, description, image, unit } = body;
        if(!name || !price || !category) {
            return NextResponse.json(
                { status: 400, message: "Missing fields required!!!" },
                { status: 400 },
            );
        }
        await connectDB();
        const product = await Product.create(
            { name, price, category, stock, description, image, unit, },
        );
        return NextResponse.json(
            { status: 201, message: "Product created successfully!!!", productId: product._id },
            { status: 201 },
        );
    } catch(error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error: error },
            { status: 500 }
        )
    }
}