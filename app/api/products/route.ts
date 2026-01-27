import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { validateAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    try {
        if (id) {
            const product = await Product.findById(id).populate('category brand');
            if (!product) {
                return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: product });
        }

        const ids = searchParams.get('ids');
        if (ids) {
            const idArray = ids.split(',').filter(Boolean);
            const products = await Product.find({ _id: { $in: idArray } }).populate('category brand');
            return NextResponse.json({ success: true, data: products });
        }

        const query: any = {};
        if (status) {
            if (status === 'published') {
                query.$or = [
                    { status: 'published' },
                    { status: { $exists: false } },
                    { status: null }
                ];
            } else {
                query.status = status;
            }
        }

        const products = await Product.find(query).populate('category brand').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('Create Error', error);
        return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ success: false, error: 'Product ID required for update' }, { status: 400 });
        }

        const product = await Product.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Update Error', error);
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const admin = token ? await validateAdminSession(token) : null;

    if (!admin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 400 });
    }
}
