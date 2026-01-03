import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const SECRET_KEY = process.env.JWT_SECRET;

export interface AuthResult {
    userId: string;
    role: string;
}

export async function getCurrentUser(): Promise<AuthResult | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return null;

        const decoded = jwt.verify(token, SECRET_KEY) as {
            id: string;
            role: string;
        };

        return {
            userId: decoded.id,
            role: decoded.role,
        };
    } catch {
        return null;
    }
}
