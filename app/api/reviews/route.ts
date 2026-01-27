import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
        }

        const reviews = await Review.find({
            productId,
            status: 'approved'
        }).sort({ createdAt: -1 }).lean();

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            reviews: reviews.map(r => ({
                _id: r._id.toString(),
                userName: r.userName,
                rating: r.rating,
                title: r.title,
                review: r.review,
                verifiedPurchase: r.verifiedPurchase,
                createdAt: r.createdAt
            })),
            averageRating: parseFloat(averageRating as string),
            reviewCount: reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { productId, userName, userEmail, rating, title, review } = body;

        if (!productId || !userName || !userEmail || !rating || !title || !review) {
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const newReview = await Review.create({
            productId,
            userName,
            userEmail,
            rating,
            title,
            review,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully! It will be visible after approval.',
            reviewId: newReview._id.toString()
        });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error'
        }, { status: 500 });
    }
}

// PUT - Approve a review (admin only)
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { reviewId, status } = body;

        if (!reviewId || !status) {
            return NextResponse.json({ success: false, message: 'Review ID and status required' }, { status: 400 });
        }

        const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });

        if (!review) {
            return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
        }

        // Update product stats
        const allReviews = await Review.find({ productId: review.productId, status: 'approved' });

        let avgRating = 0;
        if (allReviews.length > 0) {
            avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        }

        await Product.findByIdAndUpdate(review.productId, {
            averageRating: parseFloat(avgRating.toFixed(1)),
            reviewCount: allReviews.length
        });

        return NextResponse.json({ success: true, message: 'Review status updated' });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
