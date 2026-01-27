import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { generateSEOMetadata } from '@/lib/seo';
import ProductGallery from '@/components/product/ProductGallery';
import AddToCartSection from '@/components/product/AddToCartSection';
import ProductCard from '@/components/product/ProductCard';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import './ProductPage.css';

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    await connectDB();
    const product = await Product.findOne({ slug }).lean();

    if (!product) return {};

    return generateSEOMetadata({
        title: product.seo?.title || product.name,
        description: product.seo?.description || product.description,
        path: `/products/${slug}`,
        image: product.images?.[0]?.url || product.imageUrl,
    });
}

const ProductPage = async ({ params }: PageProps) => {
    const { category: catSlug, slug } = await params;
    await connectDB();

    let product = null;

    // 1. Try to extract ObjectId from SEO slug (e.g. "product-name-ID")
    const idMatch = slug.match(/-([0-9a-fA-F]{24})$/);
    if (idMatch) {
        product = await Product.findById(idMatch[1]).lean();
    }

    // 2. If not found, try exact slug match (legacy)
    if (!product) {
        product = await Product.findOne({ slug }).lean();
    }

    // 3. Last resort: if slug IS just an ID
    if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(slug).lean();
    }

    if (!product) {
        notFound();
    }

    // Related Products - same category but not this product
    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'published'
    }).limit(4).lean() as any[];

    const rawImages = (product.images && product.images.length > 0)
        ? product.images
        : (product.imageUrl ? [product.imageUrl] : []);

    const productImages = rawImages.map((img: any) => {
        if (typeof img === 'string') {
            return { url: img, alt: product.name };
        }
        return { url: img.url, alt: img.alt || product.name };
    }).filter((img: any) => img.url && typeof img.url === 'string' && img.url.trim() !== '');

    console.log(productImages);
    const originalPrice = product.compareAtPrice || product.salePrice;
    const discountPercentage = product.discountPercentage || (originalPrice && originalPrice > product.price
        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
        : null);

    const catName = typeof product.category === 'string' ? product.category : ((product.category as any)?.name || 'Category');
    const brandName = typeof product.brand === 'string' ? product.brand : ((product.brand as any)?.name || 'Brand');

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": productImages.map((img: any) => img.url),
        "description": product.description,
        "sku": product.sku,
        "brand": { "@type": "Brand", "name": brandName },
        "offers": {
            "@type": "Offer",
            "url": `${process.env.NEXT_PUBLIC_APP_URL || ''}/products/${catSlug}/${slug}`,
            "priceCurrency": "KES",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
    };

    // Sanitize product for Client Components to fix "Only plain objects" error
    const sanitizedProductData = JSON.parse(JSON.stringify(product));

    return (
        <div className="container section-py">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Breadcrumbs items={[
                { label: catName, href: `/products/${catSlug}` },
                { label: product.name, href: `/products/${catSlug}/${slug}` }
            ]} />

            <div className="product-layout">
                <ProductGallery images={productImages} name={product.name} />

                <div className="product-details">
                    <div className="product-header">
                        <p className="brand-name">{brandName}</p>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price-row">
                            <span className="current-price">KSh {product.price.toLocaleString()}</span>
                            {originalPrice && originalPrice > product.price && (
                                <span className="old-price">KSh {originalPrice.toLocaleString()}</span>
                            )}
                            {discountPercentage && (
                                <span className="discount-badge">-{discountPercentage}%</span>
                            )}
                        </div>
                    </div>

                    <div className="product-description">
                        <p>{product.description}</p>
                    </div>

                    {product.features && Object.keys(product.features).length > 0 && (
                        <div className="key-features-section">
                            <h3 className="key-features-title">Key Features:</h3>
                            <ul className="key-features-list">
                                {Object.entries(product.features).map(([key, value]: any, i: number) => (
                                    <li key={i} className="key-feature-item">
                                        <strong>{key}:</strong> {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="price-disclaimer">
                        The Price and Availability Are Subject to change without Notice.
                    </div>

                    <AddToCartSection
                        product={{
                            _id: product._id.toString(),
                            name: product.name,
                            price: product.price,
                            slug: product.slug,
                            category: catName,
                            image: productImages[0]?.url || ''
                        }}
                        variants={sanitizedProductData.variants || []}
                        storageVariants={sanitizedProductData.storageVariants || []}
                        warrantyVariants={sanitizedProductData.warrantyVariants || []}
                        simVariants={sanitizedProductData.simVariants || []}
                        colors={sanitizedProductData.colors || []}
                    />
                </div>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="product-info-sections">
                    <section className="specs-section">
                        <h2 className="info-section-title">Technical Specifications</h2>
                        <div className="specs-grid">
                            {Object.entries(product.specifications).map(([key, value]: any, i: number) => (
                                <div key={i} className="spec-item">
                                    <span className="spec-label">{key}</span>
                                    <span className="spec-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {product.youtubeVideoUrl && ((url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                const match = url.match(regExp);
                const videoId = (match && match[2].length === 11) ? match[2] : null;

                if (!videoId) return null;

                return (
                    <div className="product-video-section">
                        <h2 className="info-section-title">Product Video</h2>
                        <div className="youtube-video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                );
            })(product.youtubeVideoUrl)}

            {/* Reviews Section */}
            <div className="reviews-section">
                <h2 className="reviews-section-title">Customer Reviews</h2>

                <div className="reviews-grid">
                    <div>
                        <ReviewList productId={product._id.toString()} />
                    </div>
                    <div>
                        <div className="review-form-container">
                            <ReviewForm productId={product._id.toString()} />
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-products-section" style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>Related Products</h2>
                    <div className="product-grid">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p._id.toString()} product={JSON.parse(JSON.stringify(p))} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
