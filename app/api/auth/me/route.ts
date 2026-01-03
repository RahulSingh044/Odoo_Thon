import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, user: null },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("AUTH_ME_ERROR", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
