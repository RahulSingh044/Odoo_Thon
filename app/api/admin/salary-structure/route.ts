import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ComponentType, ValueType } from "@/app/generated/prisma/enums";
import { verifyAuth } from "@/lib/auth";

const ComponentValidation = z.object({
    type: z.nativeEnum(ComponentType),
    valueType: z.nativeEnum(ValueType),
    value: z.number().nonnegative("Value must be non-negative"),
    orderIndex: z.number().int().min(0, "Order index must be non-negative"),
});

const SalaryStructureValidation = z.object({
    designationId: z.string().uuid("Invalid designation ID"),
    components: z.array(ComponentValidation).min(1, "At least one component is required"),
});

// POST - Create a new salary structure
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
        const validation = SalaryStructureValidation.safeParse(body);

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

        const { designationId, components } = validation.data;

        // Verify designation exists
        const designation = await prisma.designation.findUnique({
            where: { id: designationId },
        });

        if (!designation) {
            return NextResponse.json(
                { success: false, message: "Designation not found" },
                { status: 404 }
            );
        }

        // Check if salary structure already exists for this designation
        const existingStructure = await prisma.salaryStructure.findUnique({
            where: { designationId },
        });

        if (existingStructure) {
            return NextResponse.json(
                { success: false, message: "Salary structure already exists for this designation. Use PUT to update it." },
                { status: 400 }
            );
        }

        // Validate component types are unique
        const componentTypes = components.map((c) => c.type);
        const uniqueTypes = new Set(componentTypes);
        if (uniqueTypes.size !== componentTypes.length) {
            return NextResponse.json(
                { success: false, message: "Component types must be unique" },
                { status: 400 }
            );
        }

        // Create salary structure with components in a transaction
        const salaryStructure = await prisma.$transaction(async (tx) => {
            const structure = await tx.salaryStructure.create({
                data: {
                    designationId,
                    components: {
                        create: components.map((comp) => ({
                            type: comp.type,
                            valueType: comp.valueType,
                            value: comp.value,
                            orderIndex: comp.orderIndex,
                        })),
                    },
                },
                include: {
                    components: {
                        orderBy: { orderIndex: "asc" },
                    },
                    designation: true,
                },
            });
            return structure;
        });

        return NextResponse.json(
            {
                success: true,
                message: "Salary structure created successfully",
                data: salaryStructure,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Salary Structure Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// PUT - Update an existing salary structure
export const PUT = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || (auth.role !== "HR" && auth.role !== "ADMIN")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validation = SalaryStructureValidation.safeParse(body);

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

        const { designationId, components } = validation.data;

        // Verify designation exists
        const designation = await prisma.designation.findUnique({
            where: { id: designationId },
        });

        if (!designation) {
            return NextResponse.json(
                { success: false, message: "Designation not found" },
                { status: 404 }
            );
        }

        // Validate component types are unique
        const componentTypes = components.map((c) => c.type);
        const uniqueTypes = new Set(componentTypes);
        if (uniqueTypes.size !== componentTypes.length) {
            return NextResponse.json(
                { success: false, message: "Component types must be unique" },
                { status: 400 }
            );
        }

        // Update salary structure (delete old components and create new ones)
        const salaryStructure = await prisma.$transaction(async (tx) => {
            // Find existing structure
            const existingStructure = await tx.salaryStructure.findUnique({
                where: { designationId },
            });

            if (!existingStructure) {
                // Create new if doesn't exist
                return await tx.salaryStructure.create({
                    data: {
                        designationId,
                        components: {
                            create: components.map((comp) => ({
                                type: comp.type,
                                valueType: comp.valueType,
                                value: comp.value,
                                orderIndex: comp.orderIndex,
                            })),
                        },
                    },
                    include: {
                        components: {
                            orderBy: { orderIndex: "asc" },
                        },
                        designation: true,
                    },
                });
            }

            // Delete old components
            await tx.salaryStructureComponent.deleteMany({
                where: { salaryStructureId: existingStructure.id },
            });

            // Update with new components
            return await tx.salaryStructure.update({
                where: { id: existingStructure.id },
                data: {
                    components: {
                        create: components.map((comp) => ({
                            type: comp.type,
                            valueType: comp.valueType,
                            value: comp.value,
                            orderIndex: comp.orderIndex,
                        })),
                    },
                },
                include: {
                    components: {
                        orderBy: { orderIndex: "asc" },
                    },
                    designation: true,
                },
            });
        });

        return NextResponse.json(
            {
                success: true,
                message: "Salary structure updated successfully",
                data: salaryStructure,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Salary Structure Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// GET - Get salary structure(s)
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
        const designationId = searchParams.get("designationId");

        if (designationId) {
            // Get specific salary structure by designation
            if (!z.string().uuid().safeParse(designationId).success) {
                return NextResponse.json(
                    { success: false, message: "Invalid designation ID format" },
                    { status: 400 }
                );
            }

            const salaryStructure = await prisma.salaryStructure.findUnique({
                where: { designationId },
                include: {
                    components: {
                        orderBy: { orderIndex: "asc" },
                    },
                    designation: {
                        include: {
                            employees: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!salaryStructure) {
                return NextResponse.json(
                    { success: false, message: "Salary structure not found for this designation" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    data: salaryStructure,
                },
                { status: 200 }
            );
        } else {
            // Get all salary structures
            const salaryStructures = await prisma.salaryStructure.findMany({
                include: {
                    components: {
                        orderBy: { orderIndex: "asc" },
                    },
                    designation: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
                orderBy: {
                    designation: {
                        name: "asc",
                    },
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    data: salaryStructures,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Get Salary Structure Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// DELETE - Delete a salary structure
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
        const designationId = searchParams.get("designationId");

        if (!designationId) {
            return NextResponse.json(
                { success: false, message: "Designation ID is required" },
                { status: 400 }
            );
        }

        if (!z.string().uuid().safeParse(designationId).success) {
            return NextResponse.json(
                { success: false, message: "Invalid designation ID format" },
                { status: 400 }
            );
        }

        // Check if salary structure exists
        const salaryStructure = await prisma.salaryStructure.findUnique({
            where: { designationId },
            include: {
                designation: {
                    include: {
                        employees: {
                            select: { id: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!salaryStructure) {
            return NextResponse.json(
                { success: false, message: "Salary structure not found" },
                { status: 404 }
            );
        }

        // Check if any employees are using this designation
        if (salaryStructure.designation.employees.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot delete salary structure. There are employees assigned to this designation.",
                },
                { status: 400 }
            );
        }

        // Delete salary structure (components will be cascade deleted)
        await prisma.salaryStructure.delete({
            where: { designationId },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Salary structure deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Salary Structure Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

