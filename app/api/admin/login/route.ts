import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { SignInSchema } from '@/lib/validators';

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const validation = SignInSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password format',
                details: validation.error.flatten()
            }, { status: 400 });
        }

        const { email, password } = validation.data;

        // 2. Ensure Default Admin Exists (Dynamic Seeding)
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            console.log('--- No admins found. Creating first admin from login credentials... ---');
            const hashedPassword = await bcrypt.hash(password, 10);
            await Admin.create({
                email: email,
                password: hashedPassword
            });
            console.log(`--- Initial Admin Created: ${email} ---`);
        }

        // 3. Find Admin
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // 4. Check Lockout
        if (admin.lockUntil && (admin.lockUntil as any) > Date.now()) {
            const timeRemaining = Math.ceil((new Date(admin.lockUntil).getTime() - Date.now()) / (1000 * 60 * 60));
            return NextResponse.json({
                success: false,
                error: `Account is locked. Try again in ${timeRemaining} hours.`
            }, { status: 403 });
        }

        // 5. Verify Password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            admin.loginAttempts += 1;

            if (admin.loginAttempts >= MAX_ATTEMPTS) {
                admin.lockUntil = new Date(Date.now() + LOCK_TIME);
                await admin.save();
                return NextResponse.json({
                    success: false,
                    error: `Too many failed attempts. Account locked for 24 hours.`
                }, { status: 403 });
            }

            const attemptsLeft = MAX_ATTEMPTS - admin.loginAttempts;
            await admin.save();

            return NextResponse.json({
                success: false,
                error: `Invalid password. ${attemptsLeft} attempts remaining.`
            }, { status: 401 });
        }

        // 6. Success
        admin.loginAttempts = 0;
        admin.lockUntil = undefined;
        await admin.save();

        // 7. Set Cookie
        const JWT_SECRET = new TextEncoder().encode(
            process.env.JWT_SECRET || 'phonemallexpress-secret-key-2026'
        );

        const token = await new SignJWT({
            adminId: admin._id.toString(),
            email: admin.email,
            role: 'admin'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('5d')
            .sign(JWT_SECRET);

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'admin_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 5 // 5 days
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ success: false, error: 'Server error during login' }, { status: 500 });
    }
}
