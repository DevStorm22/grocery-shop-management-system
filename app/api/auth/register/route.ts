import { NextResponse } from "next/server";
import { connectDB } from "../../../src/lib/db";
import { User } from "../../../src/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        await connectDB();
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return NextResponse.json({
                status: 400,
                message: "User already exists"
            })
        }
        const  hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword
        });
        return NextResponse.json({
            status: 201,
            message: "User Created",
            userID: user._id,
        });
    }
    catch (error) {
        return NextResponse.json({
            status: 500,
            message: "Internal Server Problem",
            error: error,
        });
    }
}