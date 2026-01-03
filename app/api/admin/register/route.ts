import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// import crypto from "crypto";

// function generatePassword(length = 8) {
//     return crypto
//         .randomBytes(length)
//         .toString("base64")
//         .slice(0, length);
// }

async function generateEmployeeId(
  firstName: string,
  lastName: string
) {
  const currentYear = new Date().getFullYear();

  const prefix =
    "OI" +
    firstName.slice(0, 2).toUpperCase() +
    lastName.slice(0, 2).toUpperCase() +
    currentYear;

  const serialRow = await prisma.globalSerial.update({
    where: { id: 1 },
    data: { lastSerial: { increment: 1 } },
  });

  const padded = String(serialRow.lastSerial).padStart(4, "0");

  return `${prefix}${padded}`;
}


const SignUpValidation = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    email: z.string().email("Invalid email address"),
    department: z.string().optional(),
    designation: z.string().optional(),
})


const SECRET_KEY = process.env.JWT_SECRET || "MY_SECRET_KEY";

export const POST = async (req: NextRequest) => {
    try {
        let body;
        try {
            const text = await req.text();
            if (!text || text.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "Request body is required" },
                    { status: 400 }
                );
            }
            body = JSON.parse(text);
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            return NextResponse.json(
                { success: false, message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const validation = SignUpValidation.safeParse(body);
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

        const { firstName, lastName, password, email, department, designation } = validation.data;
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
        }
        
        const name = firstName + " " + lastName;
        const employeeId = await generateEmployeeId(firstName, lastName);
        // const password = generatePassword();

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user and profile in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    employeeId,
                    email,
                    password: hashedPassword,
                    role: "EMPLOYEE",
                    profile: {
                        create: {
                            name,
                            department: department || null,
                            designation: designation || null,
                            address: "", // Placeholder, to be updated later
                            emergencyContact: "", // Placeholder, to be updated later
                            joinedAt: new Date(),
                        }
                    }
                },
                include: {
                    profile: true
                }
            });
            return user;
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: "7d" });

        const cookieStore = await cookies();

        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return NextResponse.json({ success: true, message: "Employee registered successfully" }, { status: 200 });

    } catch (error) {
        console.error("Signup Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}
