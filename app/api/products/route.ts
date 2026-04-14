import { connectDB } from "@/app/src/lib/db"
import { Product } from "@/app/src/models/Product";
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const q = searchParams.get("q") || "";
        const category =
            searchParams.get("category") || "";
        const page = Number(
            searchParams.get("page") || 1
        );
        const limit = 10;

        const skip = (page - 1) * limit;

        let filter: any = {};

        if (q) {
            filter.name = {
                $regex: q,
                $options: "i",
            };
        }

        if (
            category &&
            category !== "All"
        ) {
            filter.category = category;
        }

        const products =
            await Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

        const total =
            await Product.countDocuments(
                filter
            );

        return NextResponse.json({
            status: 200,
            products,
            pagination: {
                total,
                page,
                pages: Math.ceil(
                    total / limit
                ),
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message:
                    "Failed to fetch products",
            },
            { status: 500 }
        );
    }
}