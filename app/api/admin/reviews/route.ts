import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { validateAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const reviews = await Review.find(query)
            .populate('productId', 'name imageUrl')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            reviews: reviews.map(r => ({
                _id: r._id.toString(),
                productName: (r.productId as any)?.name || 'Unknown Product',
                productImage: (r.productId as any)?.imageUrl || '',
                userName: r.userName,
                userEmail: r.userEmail,
                rating: r.rating,
                title: r.title,
                review: r.review,
                status: r.status,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
