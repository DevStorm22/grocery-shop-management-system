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
        if(!user) {
            return NextResponse.json({
                status: 400, message: "Email not found"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return NextResponse.json({
                status: 500,
                message: "Password Invalid"
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                role: user._role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );
        return NextResponse.json({
            status: 200,
            message: "Login successful",
            token,
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: "Internal Server Problem",
            error,
        });
    }
}