import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

// GET endpoint to retrieve employee resume with complete profile
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

        // Get employee profile with all related data
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: { id: employeeProfileId },
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
                                email: true,
                            },
                        },
                    },
                },
                resume: {
                    include: {
                        skills: {
                            orderBy: {
                                createdAt: "asc",
                            },
                        },
                        certifications: {
                            orderBy: {
                                issuedDate: "desc",
                            },
                        },
                    },
                },
                bankDetails: {
                    select: {
                        accountNumber: true,
                        bankName: true,
                        ifscCode: true,
                        panNumber: true,
                        uanNumber: true,
                        verified: true,
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

        // Structure the response with complete profile information
        const completeProfile = {
            // Personal Details
            personalDetails: {
                id: employeeProfile.id,
                name: employeeProfile.name,
                photo: employeeProfile.photo,
                department: employeeProfile.department,
                phone: employeeProfile.phone,
                dob: employeeProfile.dob,
                address: employeeProfile.address,
                emergencyContact: employeeProfile.emergencyContact,
                joinedAt: employeeProfile.joinedAt,
            },
            // User Account Information
            user: employeeProfile.user,
            // Designation
            designation: employeeProfile.designation,
            // Manager Information
            manager: employeeProfile.manager,
            // Resume Information
            resume: employeeProfile.resume
                ? {
                      id: employeeProfile.resume.id,
                      about: employeeProfile.resume.about,
                      jobLove: employeeProfile.resume.jobLove,
                      interests: employeeProfile.resume.interests,
                      skills: employeeProfile.resume.skills,
                      certifications: employeeProfile.resume.certifications,
                      createdAt: employeeProfile.resume.createdAt,
                      updatedAt: employeeProfile.resume.updatedAt,
                  }
                : null,
            // Bank Details (if available)
            bankDetails: employeeProfile.bankDetails,
        };

        return NextResponse.json(
            {
                success: true,
                data: completeProfile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Employee Resume Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

