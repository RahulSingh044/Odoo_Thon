import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

const DesignationValidation = z.object({
    name: z.string().min(1, "Designation name is required"),
    description: z.string().optional(),
});

// POST - Create a new designation
export const POST = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validation = DesignationValidation.safeParse(body);

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

        const { name, description } = validation.data;

        // Check if designation with same name already exists
        const existingDesignation = await prisma.designation.findUnique({
            where: { name },
        });

        if (existingDesignation) {
            return NextResponse.json(
                { success: false, message: "Designation with this name already exists" },
                { status: 400 }
            );
        }

        // Create designation
        const designation = await prisma.designation.create({
            data: {
                name,
                description: description || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Designation created successfully",
                data: designation,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Designation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// DELETE - Delete a designation
export const DELETE = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const designationId = searchParams.get("id");

        if (!designationId) {
            return NextResponse.json(
                { success: false, message: "Designation ID is required" },
                { status: 400 }
            );
        }

        // Validate UUID format
        if (!z.string().uuid().safeParse(designationId).success) {
            return NextResponse.json(
                { success: false, message: "Invalid designation ID format" },
                { status: 400 }
            );
        }

        // Check if designation exists
        const designation = await prisma.designation.findUnique({
            where: { id: designationId },
            include: {
                employees: {
                    select: { id: true },
                    take: 1,
                },
                salaryStructure: {
                    select: { id: true },
                },
            },
        });

        if (!designation) {
            return NextResponse.json(
                { success: false, message: "Designation not found" },
                { status: 404 }
            );
        }

        // Check if designation has employees assigned
        if (designation.employees.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot delete designation. It has employees assigned. Please reassign or remove employees first.",
                },
                { status: 400 }
            );
        }

        // Check if designation has a salary structure
        if (designation.salaryStructure) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot delete designation. It has a salary structure assigned. Please delete the salary structure first.",
                },
                { status: 400 }
            );
        }

        // Delete designation
        await prisma.designation.delete({
            where: { id: designationId },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Designation deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Designation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// GET - Get all designations or a specific one
export const GET = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const designationId = searchParams.get("id");

        if (designationId) {
            // Get specific designation
            if (!z.string().uuid().safeParse(designationId).success) {
                return NextResponse.json(
                    { success: false, message: "Invalid designation ID format" },
                    { status: 400 }
                );
            }

            const designation = await prisma.designation.findUnique({
                where: { id: designationId },
                include: {
                    salaryStructure: {
                        include: {
                            components: {
                                orderBy: { orderIndex: "asc" },
                            },
                        },
                    },
                    employees: {
                        select: {
                            id: true,
                            name: true,
                            joinedAt: true,
                        },
                    },
                },
            });

            if (!designation) {
                return NextResponse.json(
                    { success: false, message: "Designation not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    data: designation,
                },
                { status: 200 }
            );
        } else {
            // Get all designations
            const designations = await prisma.designation.findMany({
                include: {
                    _count: {
                        select: {
                            employees: true,
                        },
                    },
                },
                orderBy: {
                    name: "asc",
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    data: designations,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Get Designation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

