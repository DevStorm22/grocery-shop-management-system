import { NextResponse } from "next/server";
import { connectDB } from "@/app/src/lib/db";
import { verifyToken } from "@/app/src/lib/auth";
import { User } from "@/app/src/models/User";
import { Product } from "@/app/src/models/Product";
import { Order } from "@/app/src/models/Order";

export async function GET(req: Request) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    status: 401,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded: any = verifyToken(token);
        console.log("DECODED TOKEN:", decoded);

        if (!decoded?.userId) {
            return NextResponse.json(
                {
                    status: 401,
                    message: "Invalid token",
                },
                { status: 401 }
            );
        }

        if (decoded.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json(
                {
                    status: 403,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        const users = await User.countDocuments();

        const products =
            await Product.countDocuments();

        const orders = await Order.countDocuments();

        const revenueAgg =
            await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "PAID",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount",
                        },
                    },
                },
            ]);

        const revenue =
            revenueAgg[0]?.total || 0;

        return NextResponse.json({
            status: 200,
            message: "Admin stats fetched",
            data: {
                users,
                products,
                orders,
                revenue,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 500,
                message:
                    error.message ||
                    "Internal server error",
            },
            { status: 500 }
        );
    }
}