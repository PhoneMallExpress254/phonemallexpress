import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { validateAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_token')?.value;
        const currentAdmin = adminToken ? await validateAdminSession(adminToken) : null;

        if (!currentAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Admin access required' },
                { status: 401 }
            );
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: 'Admin with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            email,
            password: hashedPassword
        });

        return NextResponse.json({
            success: true,
            message: 'New admin registered successfully'
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error during registration' },
            { status: 500 }
        );
    }
}
