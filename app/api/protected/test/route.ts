import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "../../../src/lib/auth";

export async function GET(req: NextRequest) {
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

  return NextResponse.json({
    status: 200,
    message: "You are authorized",
    userId: decoded.userId,
    role: decoded.role,
  });
}