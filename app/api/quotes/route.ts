import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quote from '@/models/Quote'; // Adjust import if file structure is different, but based on previous step it's correct
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();

        // Basic backend validation
        if (!body.organizationName || !body.contactPerson || !body.email || !body.phone || !body.requirements) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const quote = await Quote.create(body);

        return NextResponse.json({ success: true, data: quote }, { status: 201 });
    } catch (error: any) {
        console.error('Create Quote Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();

    // Verify Admin
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const JWT_SECRET = new TextEncoder().encode(
            process.env.JWT_SECRET || 'phonemallexpress-secret-key-2026'
        );
        await jwtVerify(token.value, JWT_SECRET);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const quotes = await Quote.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: quotes });
    } catch (error: any) {
        console.error('Fetch Quotes Error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
