import { jwtVerify } from 'jose';
import connectDB from './db';
import Admin from '@/models/Admin';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'phonemallexpress-secret-key-2026'
);

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { adminId: string; email: string; role: string };
    } catch (error) {
        return null;
    }
}

/**
 * Verifies if the admin still exists in the database.
 * This ensures that deleted admins are logged out.
 */
export async function validateAdminSession(token: string) {
    const payload = await verifyJWT(token);
    if (!payload || !payload.adminId) return null;

    await connectDB();
    const adminExists = await Admin.findById(payload.adminId).select('_id').lean();

    if (!adminExists) {
        return null;
    }

    return payload;
}
