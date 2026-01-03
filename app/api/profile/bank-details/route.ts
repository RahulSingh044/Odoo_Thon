import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

// Validation schema for creating bank details
const CreateBankDetailsValidation = z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    panNumber: z.string().optional(),
    uanNumber: z.string().optional()
});

// Validation schema for updating bank details
const UpdateBankDetailsValidation = z.object({
    accountNumber: z.string().min(1, "Account number is required").optional(),
    bankName: z.string().min(1, "Bank name is required").optional(),
    ifscCode: z.string().min(1, "IFSC code is required").optional(),
    panNumber: z.string().optional(),
    uanNumber: z.string().optional()
});

// GET endpoint to retrieve user bank details
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

        // Get user profile to access employeeProfileId
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // Get bank details for the user's profile
        const bankDetails = await prisma.employeeBankDetails.findUnique({
            where: { employeeProfileId: user.profile.id }
        });

        return NextResponse.json(
            {
                success: true,
                data: bankDetails || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Bank Details Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// POST endpoint to create bank details
export const POST = async (req: NextRequest) => {
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
        const validation = CreateBankDetailsValidation.safeParse(body);
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

        // Get user profile to access employeeProfileId
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // Check if bank details already exist
        const existingBankDetails = await prisma.employeeBankDetails.findUnique({
            where: { employeeProfileId: user.profile.id }
        });

        if (existingBankDetails) {
            return NextResponse.json(
                { success: false, message: "Bank details already exist. Use PATCH to update them." },
                { status: 400 }
            );
        }

        // Create bank details
        const bankDetails = await prisma.employeeBankDetails.create({
            data: {
                employeeProfileId: user.profile.id,
                accountNumber: validation.data.accountNumber,
                bankName: validation.data.bankName,
                ifscCode: validation.data.ifscCode,
                panNumber: validation.data.panNumber,
                uanNumber: validation.data.uanNumber
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Bank details created successfully",
                data: bankDetails,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Bank Details Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// PATCH endpoint to update bank details
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
        const validation = UpdateBankDetailsValidation.safeParse(body);
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

        // Get user profile to access employeeProfileId
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // Check if bank details exist
        const existingBankDetails = await prisma.employeeBankDetails.findUnique({
            where: { employeeProfileId: user.profile.id }
        });

        if (!existingBankDetails) {
            return NextResponse.json(
                { success: false, message: "Bank details not found. Use POST to create them." },
                { status: 404 }
            );
        }

        // Build update data (only include fields that are provided)
        const updateData: {
            accountNumber?: string;
            bankName?: string;
            ifscCode?: string;
            panNumber?: string | null;
            uanNumber?: string | null;
        } = {};

        if (validation.data.accountNumber !== undefined) {
            updateData.accountNumber = validation.data.accountNumber;
        }
        if (validation.data.bankName !== undefined) {
            updateData.bankName = validation.data.bankName;
        }
        if (validation.data.ifscCode !== undefined) {
            updateData.ifscCode = validation.data.ifscCode;
        }
        if (validation.data.panNumber !== undefined) {
            updateData.panNumber = validation.data.panNumber || null;
        }
        if (validation.data.uanNumber !== undefined) {
            updateData.uanNumber = validation.data.uanNumber || null;
        }

        // Update bank details
        const updatedBankDetails = await prisma.employeeBankDetails.update({
            where: { employeeProfileId: user.profile.id },
            data: updateData
        });

        return NextResponse.json(
            {
                success: true,
                message: "Bank details updated successfully",
                data: updatedBankDetails,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Bank Details Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

