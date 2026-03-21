import { NextResponse } from "next/server";
import { connectDB } from "../../src/lib/db";

export async function GET () {
    try {
        await connectDB();
        return NextResponse.json({ status: 200, message: "API Working", error: null, db: "Connected" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, message: "API Not Working", error: error, db: "Not Connected" });
    }
}