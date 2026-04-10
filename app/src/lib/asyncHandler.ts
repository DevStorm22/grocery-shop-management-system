import { NextResponse } from "next/server";
import { errorResponse } from "./apiResponse";

export const asyncHandler =
    (handler: any) =>
        async (req: Request, context: any) => {
            try {
                return await handler(req, context);
            } catch (error: any) {
                return errorResponse(
                    error.message || "Internal server error",
                    error.statusCode || 500,
                    error.errorCode || "SERVER_ERROR"
                );
            }
        };