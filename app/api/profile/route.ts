import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

// Validation schema for profile update
const UpdateProfileValidation = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    designationId: z.string().uuid("Invalid designation ID").optional(),
});

// GET endpoint to retrieve user profile
export const GET = async (req: NextRequest) => {
    try {
        // Verify authentication
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user profile with related data
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (!user.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // Return user data (excluding password)
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: user.id,
                    employeeId: user.employeeId,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    profile: userWithoutPassword.profile,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile Get Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// PATCH endpoint to update user profile
export const PATCH = async (req: NextRequest) => {
    try {
        // Verify authentication
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
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

        // Validate request body
        const validation = UpdateProfileValidation.safeParse(body);
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

        const { name, designationId } = validation.data;

        // Check if user has a profile
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (!user.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // If designationId is being updated, verify it exists
        if (designationId) {
            const designation = await prisma.designation.findUnique({
                where: { id: designationId }
            });

            if (!designation) {
                return NextResponse.json(
                    { success: false, message: "Designation not found" },
                    { status: 404 }
                );
            }
        }

        // Update profile
        const updateData: { name?: string; designationId?: string } = {};
        if (name !== undefined) updateData.name = name;
        if (designationId !== undefined) updateData.designationId = designationId;

        const updatedProfile = await prisma.employeeProfile.update({
            where: { userId: auth.userId },
            data: updateData
        });

        return NextResponse.json(
            {
                success: true,
                message: "Profile updated successfully",
                data: updatedProfile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile Update Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

