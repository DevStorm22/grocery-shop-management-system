import { connectDB } from "@/app/src/lib/db";
import { Product } from "@/app/src/models/Product";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();

        const {
            name,
            price,
            category,
            stock,
            description,
            unit,
            image,
        } = body;

        if (!name || !price || !category) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Name, price and category required",
                },
                { status: 400 }
            );
        }

        const product = await Product.create({
            name,
            price,
            category,
            stock,
            description,
            unit,
            image,
            isAvailable: true,
        });

        return NextResponse.json(
            {
                status: 201,
                message: "Product added successfully",
                product,
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message: "Failed to add product",
            },
            { status: 500 }
        );
    }
}