import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

// GET endpoint to retrieve user salary (only monthlyWage, grossSalary, netSalary)
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

        // Get salary for the user's profile (without components)
        const employeeSalary = await prisma.employeeSalary.findUnique({
            where: { employeeId: user.profile.id },
            select: {
                monthlyWage: true,
                grossSalary: true,
                netSalary: true
            }
        });

        if (!employeeSalary) {
            return NextResponse.json(
                { success: false, message: "Salary information not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: employeeSalary,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Salary Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

