import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

// GET - Get all employees list
export const GET = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Get all employees with related data
        const employees = await prisma.employeeProfile.findMany({
            where: {
                user: {
                    role: {
                        not: "HR"
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        employeeId: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                },
                designation: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                employeeId: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                joinedAt: "desc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: employees,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Employees List Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

