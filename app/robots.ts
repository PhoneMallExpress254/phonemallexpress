import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phonemallexpress.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/cart/', '/checkout/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
