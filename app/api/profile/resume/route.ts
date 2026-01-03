import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/verifyAuth";

// Validation schema for resume update
const ResumeSkillValidation = z.object({
    name: z.string().min(1, "Skill name is required"),
    level: z.string().optional(),
});

const ResumeCertificationValidation = z.object({
    title: z.string().min(1, "Certification title is required"),
    issuer: z.string().optional(),
    issuedDate: z.string().datetime().optional().or(z.string().optional()),
    certificateUrl: z.string().url().optional().or(z.string().optional()),
});

const UpdateResumeValidation = z.object({
    about: z.string().optional(),
    jobLove: z.string().optional(),
    interests: z.string().optional(),
    skills: z.array(ResumeSkillValidation).optional(),
    certifications: z.array(ResumeCertificationValidation).optional(),
});

// GET endpoint to retrieve user resume
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

        // Get resume for the user's profile
        const resume = await prisma.resume.findUnique({
            where: { employeeProfileId: user.profile.id },
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
        });

        return NextResponse.json(
            {
                success: true,
                data: resume || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get Resume Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

// PATCH endpoint to update or create resume
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

        // Parse request body
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

        // Validate request body
        const validation = UpdateResumeValidation.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map((error) => ({
                field: error.path.length ? error.path.join(".") : "form",
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

        const { about, jobLove, interests, skills, certifications } = validation.data;
        const employeeProfileId = user.profile.id;

        // Use transaction to ensure data consistency
        const updatedResume = await prisma.$transaction(async (tx) => {
            // Upsert resume (create if not exists, update if exists)
            const resume = await tx.resume.upsert({
                where: { employeeProfileId },
                update: {
                    ...(about !== undefined && { about }),
                    ...(jobLove !== undefined && { jobLove }),
                    ...(interests !== undefined && { interests }),
                },
                create: {
                    employeeProfileId,
                    about: about || null,
                    jobLove: jobLove || null,
                    interests: interests || null,
                },
            });

            // Handle skills update if provided
            if (skills !== undefined) {
                // Delete existing skills
                await tx.resumeSkill.deleteMany({
                    where: { resumeId: resume.id },
                });

                // Create new skills
                if (skills.length > 0) {
                    await tx.resumeSkill.createMany({
                        data: skills.map((skill) => ({
                            resumeId: resume.id,
                            name: skill.name,
                            level: skill.level || null,
                        })),
                    });
                }
            }

            // Handle certifications update if provided
            if (certifications !== undefined) {
                // Delete existing certifications
                await tx.resumeCertification.deleteMany({
                    where: { resumeId: resume.id },
                });

                // Create new certifications
                if (certifications.length > 0) {
                    await tx.resumeCertification.createMany({
                        data: certifications.map((cert) => ({
                            resumeId: resume.id,
                            title: cert.title,
                            issuer: cert.issuer || null,
                            issuedDate: cert.issuedDate ? new Date(cert.issuedDate) : null,
                            certificateUrl: cert.certificateUrl || null,
                        })),
                    });
                }
            }

            // Return updated resume with relations
            return tx.resume.findUnique({
                where: { id: resume.id },
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
            });
        });

        return NextResponse.json(
            {
                success: true,
                message: "Resume updated successfully",
                data: updatedResume,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Resume Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

