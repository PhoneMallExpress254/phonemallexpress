import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSEOMetadata } from '@/lib/seo';
import CategoryFilters from './CategoryFilters';
import Pagination from '@/components/ui/Pagination';
import './CategoryPage.css';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ brand?: string; minPrice?: string; maxPrice?: string; search?: string; page?: string; type?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { category: slug } = await params;
    await connectDB();
    const category = await Category.findOne({ slug });

    if (!category) return {};

    return generateSEOMetadata({
        title: category.name,
        description: category.description || `Browse our wide selection of ${category.name} accessories.`,
        path: `/accessories/${slug}`,
        image: category.image,
    });
}

async function getCategoryProducts(categorySlug: string, search?: string, brand?: string, subcategory?: string, page: number = 1, limit: number = 20) {
    await connectDB();
    let query: any = { status: 'published' };

    // Handle Search
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Handle Brand
    if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
    }

    // Handle Subcategory (Type)
    if (subcategory) {
        query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Handle Category
    if (categorySlug !== 'all') {
        const categoryDoc = await Category.findOne({ slug: categorySlug });
        if (categoryDoc) {
            query.category = categoryDoc._id;
        } else {
            // Support jelectronics string categories (fallback)
            const formattedSlug = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
            query.category = { $in: [categorySlug, formattedSlug] };
        }
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
        Product.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
        Product.countDocuments(query)
    ]);

    return {
        products: JSON.parse(JSON.stringify(products)),
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
}

const CategoryPage = async ({ params, searchParams }: PageProps) => {
    const { category: slug } = await params;
    const { search, brand, page, type } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 20;

    await connectDB();

    // Check if category exists (logic simplified for brevity as we need fallback for 'all')
    let categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    if (slug !== 'all') {
        const category = await Category.findOne({ slug }).lean();
        if (category) {
            categoryName = category.name;
        }
    } else {
        categoryName = 'All Accessories';
    }

    const { products, totalPages, totalCount } = await getCategoryProducts(slug, search, brand, type, currentPage, limit);

    return (
        <div className="container" style={{ paddingTop: '0.15rem', paddingBottom: 'var(--spacing-lg)' }}>
            <div className="shop-layout">
                {/* Mobile Filters Toggle would go here */}
                <aside className="shop-sidebar">
                    <CategoryFilters />
                </aside>

                <main className="shop-content">


                    <div className="product-grid">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 ? (
                        <div className="no-products">
                            <p>No products found in this category.</p>
                        </div>
                    ) : (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default CategoryPage;
