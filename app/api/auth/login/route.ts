import { NextResponse } from "next/server";
import { connectDB } from "@/app/src/lib/db";
import { User } from "@/app/src/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid user",
                },
                { status: 400 }
            );
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                {
                    status: 400,
                    message: "Invalid password",
                },
                { status: 400 }
            );
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role, },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                status: 200,
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("🔥 LOGIN ERROR FULL:", error); // full object
        console.error("🔥 LOGIN ERROR MESSAGE:", error?.message); // message only

        return NextResponse.json(
            {
                status: 500,
                message: "Internal server error",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}