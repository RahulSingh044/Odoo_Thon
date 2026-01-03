import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";
import { AttendanceStatus } from "@/app/generated/prisma/enums";

// Validation schema for check-out (optional breakMinutes)
const CheckOutValidation = z.object({
    breakMinutes: z.number().int().min(0).optional(),
});

// GET endpoint to retrieve all attendance data day wise
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

        // Get all attendance records for the user, ordered by date (newest first)
        const attendance = await prisma.attendance.findMany({
            where: { employeeProfileId: user.profile.id },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: attendance,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Attendance Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// POST endpoint to check in
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
        const now = new Date();
        
        // Get today's date (start of day, 00:00:00)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check if attendance record already exists for today
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                employeeProfileId_date: {
                    employeeProfileId,
                    date: today,
                },
            },
        });

        if (existingAttendance) {
            // If check-in already exists, return error
            if (existingAttendance.checkIn) {
                return NextResponse.json(
                    { success: false, message: "You have already checked in today" },
                    { status: 400 }
                );
            }
            
            // Update existing record with check-in
            const updatedAttendance = await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkIn: now,
                    status: AttendanceStatus.PRESENT,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Checked in successfully",
                    data: updatedAttendance,
                },
                { status: 200 }
            );
        }

        // Create new attendance record with check-in
        const attendance = await prisma.attendance.create({
            data: {
                employeeProfileId,
                date: today,
                checkIn: now,
                status: AttendanceStatus.PRESENT,
                isPayable: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Checked in successfully",
                data: attendance,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Check In Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// PATCH endpoint to check out
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

        // Parse request body (optional breakMinutes)
        let body = {};
        try {
            const text = await req.text();
            if (text && text.trim().length > 0) {
                body = JSON.parse(text);
            }
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            return NextResponse.json(
                { success: false, message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate request body
        const validation = CheckOutValidation.safeParse(body);
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
        const now = new Date();
        
        // Get today's date (start of day, 00:00:00)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Find today's attendance record
        const attendance = await prisma.attendance.findUnique({
            where: {
                employeeProfileId_date: {
                    employeeProfileId,
                    date: today,
                },
            },
        });

        if (!attendance) {
            return NextResponse.json(
                { success: false, message: "No check-in found for today. Please check in first." },
                { status: 404 }
            );
        }

        if (!attendance.checkIn) {
            return NextResponse.json(
                { success: false, message: "No check-in found for today. Please check in first." },
                { status: 400 }
            );
        }

        if (attendance.checkOut) {
            return NextResponse.json(
                { success: false, message: "You have already checked out today" },
                { status: 400 }
            );
        }

        // Calculate work minutes
        const checkInTime = new Date(attendance.checkIn);
        const checkOutTime = now;
        const totalMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));
        
        // Get break minutes from request or default to 0
        const breakMinutes = validation.data.breakMinutes ?? 0;
        const workMinutes = Math.max(0, totalMinutes - breakMinutes);
        
        // Calculate extra minutes (overtime) - assuming 8 hours (480 minutes) is standard
        const standardWorkMinutes = 480;
        const extraMinutes = workMinutes > standardWorkMinutes ? workMinutes - standardWorkMinutes : 0;

        // Update attendance with check-out and calculated values
        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: checkOutTime,
                workMinutes,
                breakMinutes,
                extraMinutes,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Checked out successfully",
                data: updatedAttendance,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Check Out Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

