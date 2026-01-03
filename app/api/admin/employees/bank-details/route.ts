import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

// GET - Get a particular employee's bank details
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

        if (!employeeProfileId) {
            return NextResponse.json(
                { success: false, message: "employeeProfileId is required" },
                { status: 400 }
            );
        }

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
            include: {
                user: {
                    select: {
                        id: true,
                        employeeId: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!employeeProfile) {
            return NextResponse.json(
                { success: false, message: "Employee profile not found" },
                { status: 404 }
            );
        }

        // Get bank details for the specific employee
        const bankDetails = await prisma.employeeBankDetails.findUnique({
            where: { employeeProfileId: employeeProfileId },
            include: {
                employeeProfile: {
                    include: {
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
            },
        });

        if (!bankDetails) {
            return NextResponse.json(
                { success: false, message: "Bank details not found for this employee" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: bankDetails,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Employee Bank Details Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

