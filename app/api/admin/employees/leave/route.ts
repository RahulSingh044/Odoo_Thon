import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

// Validation schema for leave application review
const LeaveReviewValidation = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reviewComment: z.string().optional(),
});

// GET endpoint to retrieve leave applications (with optional filters)
export const GET = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const employeeProfileId = searchParams.get("employeeProfileId");
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        // Build where clause
        const where: any = {};

        if (employeeProfileId) {
            // Validate UUID format
            if (!z.string().uuid().safeParse(employeeProfileId).success) {
                return NextResponse.json(
                    { success: false, message: "Invalid employee profile ID format" },
                    { status: 400 }
                );
            }

            // Verify employee profile exists
            const employeeProfile = await prisma.employeeProfile.findUnique({
                where: { id: employeeProfileId },
            });

            if (!employeeProfile) {
                return NextResponse.json(
                    { success: false, message: "Employee profile not found" },
                    { status: 404 }
                );
            }

            where.employeeProfileId = employeeProfileId;
        }

        if (status && ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
            where.status = status;
        }

        if (type && ["PAID", "SICK", "UNPAID"].includes(type)) {
            where.type = type;
        }

        // Get all leave applications with employee and reviewer info
        const leaveApplications = await prisma.leaveApplication.findMany({
            where,
            orderBy: {
                appliedAt: "desc",
            },
            include: {
                employeeProfile: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                id: true,
                                employeeId: true,
                                email: true,
                                role: true,
                            },
                        },
                        designation: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
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

// PATCH endpoint to approve or reject leave application
export const PATCH = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
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
        const validation = LeaveReviewValidation.safeParse(body);
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

        // Get leave application ID from query params
        const { searchParams } = new URL(req.url);
        const leaveApplicationId = searchParams.get("leaveApplicationId");

        if (!leaveApplicationId) {
            return NextResponse.json(
                { success: false, message: "leaveApplicationId is required" },
                { status: 400 }
            );
        }

        // Validate UUID format
        if (!z.string().uuid().safeParse(leaveApplicationId).success) {
            return NextResponse.json(
                { success: false, message: "Invalid leave application ID format" },
                { status: 400 }
            );
        }

        // Verify leave application exists
        const leaveApplication = await prisma.leaveApplication.findUnique({
            where: { id: leaveApplicationId },
        });

        if (!leaveApplication) {
            return NextResponse.json(
                { success: false, message: "Leave application not found" },
                { status: 404 }
            );
        }

        // Check if already reviewed
        if (leaveApplication.status !== "PENDING") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Leave application has already been ${leaveApplication.status.toLowerCase()}`,
                },
                { status: 400 }
            );
        }

        // Update leave application
        const updatedLeaveApplication = await prisma.leaveApplication.update({
            where: { id: leaveApplicationId },
            data: {
                status: validation.data.status as "APPROVED" | "REJECTED",
                reviewedById: auth.userId,
                reviewedAt: new Date(),
                reviewComment: validation.data.reviewComment || null,
            },
            include: {
                employeeProfile: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                id: true,
                                employeeId: true,
                                email: true,
                                role: true,
                            },
                        },
                        designation: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
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
                message: `Leave application ${validation.data.status.toLowerCase()} successfully`,
                data: updatedLeaveApplication,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Review Leave Application Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

