import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { validateAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
