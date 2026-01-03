import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "MY_SECRET_KEY";

export interface AuthResult {
    userId: string;
    role: string;
}

/**
 * Verifies authentication token from cookies and returns user info
 * @param req - NextRequest object
 * @returns AuthResult with userId and role, or null if authentication fails
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string };
        return { userId: decoded.id, role: decoded.role };
    } catch (error) {
        return null;
    }
}

/**
 * Gets the JWT secret key
 * @returns The JWT secret key
 */
export function getSecretKey(): string {
    return SECRET_KEY;
}