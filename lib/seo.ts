import { Metadata } from 'next';

interface SEOProps {
    title: string;
    description: string;
    path: string;
    image?: string;
    type?: 'website' | 'article';
}

export function generateSEOMetadata({
    title,
    description,
    path,
    image = '/og-image.jpg',
    type = 'website'
}: SEOProps): Metadata {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://phonemallexpress.com'}${path}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            type,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}
