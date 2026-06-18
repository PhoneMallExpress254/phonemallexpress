import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const email = (body?.email || '').trim().toLowerCase();

        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ success: false, error: 'Please provide a valid email address' }, { status: 400 });
        }

        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return NextResponse.json({ success: true, message: 'You are already subscribed!' }, { status: 200 });
        }

        await Subscriber.create({ email, source: body?.source || 'homepage' });

        return NextResponse.json({ success: true, message: 'Subscribed! Watch your inbox for deals.' }, { status: 201 });
    } catch (error: any) {
        console.error('Newsletter Subscribe Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
