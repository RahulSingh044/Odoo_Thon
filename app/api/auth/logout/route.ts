import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const POST = async () => {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("token");
        return NextResponse.json({ success: true, message: "User logged out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}