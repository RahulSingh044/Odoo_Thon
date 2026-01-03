import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

// Validation schema for leave application
const LeaveApplicationValidation = z.object({
    type: z.enum(["PAID", "SICK", "UNPAID"]),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    reason: z.string().optional(),
});

// POST endpoint to create a leave application
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
            body = await req.json();
        } catch (jsonError) {
            return NextResponse.json(
                { success: false, message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate request body
        const validation = LeaveApplicationValidation.safeParse(body);
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

        const employeeProfileId = user.profile.id;
        const startDate = new Date(validation.data.startDate);
        const endDate = new Date(validation.data.endDate);

        // Validate dates
        if (startDate >= endDate) {
            return NextResponse.json(
                { success: false, message: "End date must be after start date" },
                { status: 400 }
            );
        }

        // Calculate total days (inclusive of both start and end dates)
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        if (daysDiff <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid date range" },
                { status: 400 }
            );
        }

        // Create leave application
        const leaveApplication = await prisma.leaveApplication.create({
            data: {
                employeeProfileId,
                type: validation.data.type as "PAID" | "SICK" | "UNPAID",
                status: "PENDING",
                startDate,
                endDate,
                totalDays: daysDiff,
                reason: validation.data.reason || null,
            },
            include: {
                employeeProfile: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                reviewedBy: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Leave application submitted successfully",
                data: leaveApplication,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Leave Application Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// GET endpoint to retrieve leave application status
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

        // Get query parameters for filtering
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        // Build where clause
        const where: any = {
            employeeProfileId: user.profile.id,
        };

        if (status && ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
            where.status = status;
        }

        if (type && ["PAID", "SICK", "UNPAID"].includes(type)) {
            where.type = type;
        }

        // Get all leave applications for the user, ordered by applied date (newest first)
        const leaveApplications = await prisma.leaveApplication.findMany({
            where,
            orderBy: {
                appliedAt: "desc",
            },
            include: {
                reviewedBy: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: leaveApplications,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Leave Applications Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

