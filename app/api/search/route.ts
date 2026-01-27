import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ products: [], totalCount: 0, totalPages: 0 });
        }

        await dbConnect();

        const searchQuery = {
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                },
                { status: 'published' }
            ]
        };

        // Use regex search for flexibility (works without text indexes)
        const [products, totalCount] = await Promise.all([
            Product.find(searchQuery)
                .skip(skip)
                .limit(limit)
                .select('name slug price compareAtPrice salePrice imageUrl images category')
                .lean(),
            Product.countDocuments(searchQuery)
        ]);

        return NextResponse.json({
            products: JSON.parse(JSON.stringify(products)),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            query
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
