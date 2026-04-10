import { NextResponse } from "next/server";

export const successResponse = (
    message: string,
    data: any = {},
    status: number = 200
) => {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    );
};

export const errorResponse = (
    message: string,
    status: number = 500,
    error: string = "INTERNAL_SERVER_ERROR"
) => {
    return NextResponse.json(
        {
            success: false,
            message,
            error,
        },
        { status }
    );
};