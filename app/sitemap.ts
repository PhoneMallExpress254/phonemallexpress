import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const BASE_URL = 'https://phonemallexpress.com';

    await connectDB();

    // Fetch all categories and products
    const categories = await Category.find({}, { slug: 1, updatedAt: 1 }).lean();
    const products = await Product.find({}, { slug: 1, category: 1, updatedAt: 1 }).populate('category', 'slug').lean();

    const categoryUrls = categories.map((cat) => ({
        url: `${BASE_URL}/products/${cat.slug}`,
        lastModified: (cat as any).updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const productUrls = products.map((prod) => ({
        url: `${BASE_URL}/products/${(prod.category as any).slug}/${prod.slug}`,
        lastModified: (prod as any).updatedAt,
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/shipping',
        '/faq',
        '/privacy',
        '/bulk-quote',
        '/repairs',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    return [
        ...staticRoutes,
        ...categoryUrls,
        ...productUrls,
    ];
}
