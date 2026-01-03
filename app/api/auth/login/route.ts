import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const SECRET_KEY = process.env.JWT_SECRET || "MY_SECRET_KEY";

const LoginValidation = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST = async (req: NextRequest) => {
    try {
        let body;
        try {
            const text = await req.text();
            if (!text || text.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "Request body is required" },
                    { status: 400 }
                );
            }
            body = JSON.parse(text);
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            return NextResponse.json(
                { success: false, message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const validation = LoginValidation.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map((error) => ({
                field: error.path.length ? error.path[0] : "form",
                message: error.message,
            }));

            return NextResponse.json(
                { success: false, message: "Validation error", errors },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        const cookieStore = await cookies();

        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return NextResponse.json(
            {
                success: true,
                message: "User logged in successfully",
                role: user.role,
                token,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};