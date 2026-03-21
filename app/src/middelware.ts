import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
export function middleware(req: NextRequest) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if(!token) {
        return NextResponse.json(
            { status: 401, message: "Invalid Token" },
            { status: 401 }
        );
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        return NextResponse.next();
    } catch (error) {
        return NextResponse.json(
            {status: 401, message: "Invalid Token"},
            {status: 401}
        );
    }
}
export const config = {
    matcher: ["/api/protected/:path*"],
};