import { verifyToken } from "@/app/src/lib/auth";
import { connectDB } from "@/app/src/lib/db";
import { Cart } from "@/app/src/models/Cart";
import { Product } from "@/app/src/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
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

        const userId = decoded.userId;

        const body = await req.json();

        const { productId, quantity } = body;
        if(!productId || !mongoose.Types.ObjectId.isValid(productId))
        {
            return NextResponse.json(
                { status: 400, message: "Invalid product Id" },
                { status: 400 },
            );
        }
        if(!quantity || quantity < 1) {
            return NextResponse.json(
                {status: 400, message: "Quantity must be at least 1",},
                {status: 400,},
            );
        }
        const product = await Product.findById(productId);
        if(!product || !product.isAvailable) {
            return NextResponse.json(
                { status: 404, message: "Product Not Found" },
                { status: 404 },
            );
        }
        let cart = await Cart.findOne({ user: userId });
        if(!cart) {
            cart = await Cart.create({
                user: userId,
                items: [ { product: productId, quantity } ],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (items: any) => items.product.toString() === productId.toString()
            );
            if(itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity; 
            } else {
                cart.items.push({product: productId, quantity})
            }
            await cart.save();
        }

        return NextResponse.json(
            {status: 200, message: "Product added to cart", cart},
            {status: 200},
        )
    } catch(error) {
        return NextResponse.json(
            { status: 500, message: "Internal server error", error, },
            { status: 500, },
        )
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const authHeader = req.headers.get("authorization");
        if(!authHeader || !authHeader.startsWith("Bearer")) {
            return NextResponse.json(
                { status: 401, message: "Invalid token" },
                { status: 401 },
            );
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        const userId = decoded?.userId;
        if(!decoded) {
            return NextResponse.json(
                { status: 401, message: "invalid Token" },
                { status: 401 },
            );
        }
        const cartItems = await Cart.findOne({ user: userId});
        return NextResponse.json(
            {status: 200, message: "Cart Items", cartItems,},
            {status: 200,},
        );
    } catch (error) {
        return NextResponse.json(
            {status: 500, message: "Internal server problem", error,},
            {status: 500,},
        );
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();

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

        const userId = decoded.userId;

        const { productId, quantity } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { status: 400, message: "Invalid product Id" },
                { status: 400 }
            );
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return NextResponse.json(
                { status: 404, message: "Cart not found" },
                { status: 404 }
            );
        }

        const itemIndex = cart.items.findIndex(
            (item: any) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return NextResponse.json(
                { status: 404, message: "Product not in cart" },
                { status: 404 }
            );
        }

        cart.items[itemIndex].quantity = quantity;

        await cart.save();

        return NextResponse.json(
            { status: 200, message: "Cart updated", cart },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { status: 500, message: "Internal server problem", error },
            { status: 500 }
        );
    }
}
export async function DELETE(req: Request) {
    try {
        await connectDB();

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

        const userId = decoded.userId;

        const { productId } = await req.json();

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return NextResponse.json(
                { status: 404, message: "Cart not found" },
                { status: 404 }
            );
        }

        cart.items = cart.items.filter(
            (item: any) => item.product.toString() !== productId
        );

        await cart.save();

        return NextResponse.json(
            { status: 200, message: "Item removed", cart },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { status: 500, message: "Internal server error", error },
            { status: 500 }
        );
    }
}