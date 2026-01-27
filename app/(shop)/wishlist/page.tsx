"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import './WishlistPage.css';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            slug: item.slug,
            category: item.category
        });
        removeFromWishlist(item.id);
    };

    if (wishlist.length === 0) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Heart size={64} style={{ color: 'var(--border)', marginBottom: 'var(--spacing-md)' }} />
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>Your Wishlist is Empty</h1>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--spacing-lg)' }}>Save items you love so you can easily find them later.</p>
                <Link href="/accessories" className="btn btn-primary">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Breadcrumbs items={[{ label: 'Wishlist', href: '/wishlist' }]} />

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-lg)' }}>
                My Wishlist ({wishlist.length})
            </h1>

            <div className="wishlist-grid">
                {wishlist.map((item) => (
                    <div key={item.id} className="product-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Link href={`/accessories/${item.category?.toLowerCase() || 'products'}/${item.slug}`} className="product-image-link">
                            <div className="product-image-container" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--input)' }}>
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        className="product-image"
                                        style={{ objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="product-image-placeholder" />
                                )}
                            </div>
                        </Link>

                        <div className="product-info">
                            <Link href={`/accessories/${item.category?.toLowerCase() || 'products'}/${item.slug}`}>
                                <h3 className="product-name">{item.name}</h3>
                            </Link>

                            <div className="product-price-container">
                                <span className="product-price">KSh {item.price.toLocaleString()}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, fontSize: 'var(--font-size-xs)', padding: '0.5rem' }}
                                >
                                    <ShoppingCart size={16} style={{ marginRight: '4px' }} />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem', borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
