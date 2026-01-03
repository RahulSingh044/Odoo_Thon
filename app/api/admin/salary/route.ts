import prisma from "@/lib/prisma";
import { PrismaClient } from "@/app/generated/prisma/client";
import { ComponentType } from "@/app/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

// Type definitions
type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

const SalaryValidation = z.object({
    employeeProfileId: z.string().uuid("Invalid employee profile ID"),
    monthlyWage: z.number().positive("Monthly wage must be positive"),
});

/**
 * Calculates salary structure for an employee based on their designation's salary structure
 * Returns calculated components, gross salary, net salary, and deductions (PF, tax)
 */
async function calculateSalaryFromStructure({
    employeeProfileId,
    monthlyWage,
    tx,
}: {
    employeeProfileId: string;
    monthlyWage: number;
    tx: TransactionClient;
}) {
    const profile = await tx.employeeProfile.findUnique({
        where: { id: employeeProfileId },
        include: {
            designation: {
                include: {
                    salaryStructure: {
                        include: {
                            components: { orderBy: { orderIndex: "asc" } },
                        },
                    },
                },
            },
        },
    });

    if (!profile?.designation.salaryStructure) {
        throw new Error("Salary structure not defined for designation");
    }

    const structure = profile.designation.salaryStructure.components;

    let basic = 0;
    let total = 0;

    const calculatedComponents: {
        type: string;
        amount: number;
    }[] = [];

    // 1️⃣ Calculate all except FIXED_ALLOWANCE
    for (const comp of structure) {
        if (comp.type === "FIXED_ALLOWANCE") continue;

        let amount = 0;

        if (comp.valueType === "FIXED") {
            amount = comp.value;
        } else {
            // percentage
            if (comp.type === "BASIC") {
                amount = (monthlyWage * comp.value) / 100;
                basic = amount;
            } else {
                amount =
                    comp.type === "HRA"
                        ? (basic * comp.value) / 100
                        : (monthlyWage * comp.value) / 100;
            }
        }

        total += amount;
        calculatedComponents.push({ type: comp.type, amount });
    }

    // 2️⃣ Fixed Allowance = remainder
    const fixedAllowance = Math.max(monthlyWage - total, 0);
    total += fixedAllowance;

    calculatedComponents.push({
        type: "FIXED_ALLOWANCE",
        amount: fixedAllowance,
    });

    // 3️⃣ PF & Tax (hard rules, calculated once)
    const pfEmployee = basic * 0.12;
    const pfEmployer = basic * 0.12;
    const professionalTax = 200;

    const netSalary = total - pfEmployee - professionalTax;

    return {
        components: calculatedComponents,
        grossSalary: total,
        netSalary,
        pfEmployee,
        pfEmployer,
        professionalTax,
    };
}

export const POST = async (req: NextRequest) => {
    try {
        const auth = await verifyAuth(req);
        if (!auth || auth.role !== "HR") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const body = SalaryValidation.parse(await req.json());

        // Verify employee profile exists
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: { id: body.employeeProfileId },
        });

        if (!employeeProfile) {
            return NextResponse.json(
                { success: false, message: "Employee profile not found" },
                { status: 404 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const salary = await tx.employeeSalary.upsert({
                where: { employeeId: body.employeeProfileId },
                update: { monthlyWage: body.monthlyWage },
                create: {
                    employeeId: body.employeeProfileId,
                    monthlyWage: body.monthlyWage,
                    grossSalary: 0,
                    netSalary: 0,
                    pfEmployee: 0,
                    pfEmployer: 0,
                    professionalTax: 0,
                },
            });

            const calc = await calculateSalaryFromStructure({
                employeeProfileId: body.employeeProfileId,
                monthlyWage: body.monthlyWage,
                tx,
            });

            // delete old components
            await tx.employeeSalaryComponent.deleteMany({
                where: { employeeSalaryId: salary.id },
            });

            // save components
            await tx.employeeSalaryComponent.createMany({
                data: calc.components.map((c) => ({
                    employeeSalaryId: salary.id,
                    type: c.type as ComponentType,
                    amount: c.amount,
                })),
            });

            // update totals
            return tx.employeeSalary.update({
                where: { id: salary.id },
                data: {
                    grossSalary: calc.grossSalary,
                    netSalary: calc.netSalary,
                    pfEmployee: calc.pfEmployee,
                    pfEmployer: calc.pfEmployer,
                    professionalTax: calc.professionalTax,
                },
                include: { components: true },
            });
        });

        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
};

// GET endpoint to retrieve salary information
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

        const { searchParams } = new URL(req.url);
        const employeeProfileId = searchParams.get("employeeProfileId");

        if (!employeeProfileId) {
            return NextResponse.json(
                { success: false, message: "employeeProfileId is required" },
                { status: 400 }
            );
        }

        // HR can access any employee's salary, employees can only access their own
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: { id: employeeProfileId },
            include: {
                user: true,
            }
        });

        if (!employeeProfile) {
            return NextResponse.json(
                { success: false, message: "Employee profile not found" },
                { status: 404 }
            );
        }

        // Check if employee is trying to access their own salary or if user is HR
        if (auth.role !== "HR" && employeeProfile.userId !== auth.userId) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            );
        }

        const employeeSalary = await prisma.employeeSalary.findUnique({
            where: { employeeId: employeeProfileId },
            include: {
                employee: {
                    include: {
                        designation: {
                            include: {
                                salaryStructure: {
                                    include: {
                                        components: {
                                            orderBy: { orderIndex: "asc" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                components: {
                    orderBy: {
                        type: "asc"
                    }
                }
            }
        });

        if (!employeeSalary) {
            return NextResponse.json(
                { success: false, message: "Salary information not found for this employee" },
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
        console.error("Salary Get Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

