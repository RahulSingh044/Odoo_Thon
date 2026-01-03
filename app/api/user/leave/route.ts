import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

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
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const parsed = LeaveApplicationValidation.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: parsed.error.issues.map(err => ({
                        field: err.path[0],
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { profile: true },
        });

        if (!user?.profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        const startDate = new Date(parsed.data.startDate);
        const endDate = new Date(parsed.data.endDate);

        // ✅ FIXED DATE CHECK
        if (endDate < startDate) {
            return NextResponse.json(
                { success: false, message: "End date cannot be before start date" },
                { status: 400 }
            );
        }

        const timeDiff = endDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        const leaveApplication = await prisma.leaveApplication.create({
            data: {
                employeeProfileId: user.profile.id,
                type: parsed.data.type,
                status: "PENDING",
                startDate,
                endDate,
                totalDays,
                reason: parsed.data.reason || null,
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
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
};
