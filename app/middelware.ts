import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
export function middleware(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { status: 401, message: "Unauthenticated" },
            { status: 401 }
        );
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
        };

        const { role } = decoded;
        const path = req.nextUrl.pathname;

        if(!decoded.role) {
            return NextResponse.json(
                { status: 401, message: "Invalid token payload" },
                { status: 401 }
            )
        }

        if(path.includes("/api/protected/admin") && role !== "admin") {
            return NextResponse.json(
                { status: 403, message: "Restricted area!! Only admin can access this" },
                { status: 403 },
            )
        }

        if(path.includes("/api/protected/staff") && role !== "admin" && role !== "staff") {
            return NextResponse.json(
                { status: 403, message: "Restricted area!! Only admin or staff can access this" },
                { status: 403 },
            );
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", decoded.userId);
        requestHeaders.set("x-user-role", decoded.role);
        console.log("Middleware triggered:", req.nextUrl.pathname);
        console.log("Role:", role);
        console.log("Path:", path);
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
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