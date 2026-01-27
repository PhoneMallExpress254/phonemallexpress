"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import './ProductCard.css';
import CompareButton from './CompareButton';

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice?: number;
        salePrice?: number;
        isOnSpecialOffer?: boolean;
        discountPercentage?: number;
        imageUrl?: string;
        images?: { url: string; alt: string }[];
        category: string | { name: string; slug: string };
    };
}

const ProductCard = ({ product }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // Determine the product image, prioritizing images[0] then imageUrl
    let productImage = product.images?.[0]?.url || product.imageUrl;
    const productAlt = product.images?.[0]?.alt || product.name;

    // Price Logic
    let currentPrice = product.price;
    let oldPrice = product.compareAtPrice;
    let discount = null;

    if (product.isOnSpecialOffer && product.salePrice) {
        currentPrice = product.salePrice;
        oldPrice = product.price;
        discount = product.discountPercentage || Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    } else if (oldPrice && oldPrice > currentPrice) {
        discount = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    }

    // Fallback: if jelectronics style "salePrice as standard" was used before, keeping safe
    // But aligning with new "isOnSpecialOffer" flag for explicit sales.

    // Handle category name and link slug
    const catName = typeof product.category === 'string' ? product.category : product.category.name;
    const catSlug = typeof product.category === 'string' ? product.category.toLowerCase() : product.category.slug;

    const inWishlist = isInWishlist(product._id);

    const seoSlug = `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${product._id}`;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product._id,
            name: product.name,
            price: currentPrice, // Use current display price
            quantity: 1,
            image: productImage || '',
            slug: product.slug,
            category: catName
        });
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist({
                id: product._id,
                name: product.name,
                price: currentPrice,
                image: productImage || '',
                slug: product.slug,
                category: catName
            });
        }
    };

    return (
        <div className="product-card">
            <Link href={`/products/${catSlug}/${seoSlug}`} className="product-image-link">
                <div className="product-image-container">
                    {productImage && !imageError ? (
                        <Image
                            src={productImage}
                            alt={productAlt}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="product-image"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="product-image-placeholder" />
                    )}
                    {discount && <span className="discount-badge">-{discount}%</span>}
                    {product.isOnSpecialOffer && <span className="special-offer-badge">SALE</span>}


                    // ...

                    <button
                        className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                        onClick={handleWishlistToggle}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                    </button>

                    <div className="card-compare-btn-wrapper">
                        <CompareButton product={product} />
                    </div>
                </div>
            </Link>

            <div className="product-info">
                <Link href={`/products/${catSlug}`} className="product-category">
                    {catName}
                </Link>
                <Link href={`/products/${catSlug}/${seoSlug}`}>
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="product-footer-row">
                    <div className="product-price-container">
                        <span className="product-price">KSh {currentPrice.toLocaleString()}</span>
                        {oldPrice && oldPrice > currentPrice && (
                            <span className="product-old-price">KSh {oldPrice.toLocaleString()}</span>
                        )}
                    </div>

                    <button
                        className="add-to-cart-action-btn"
                        aria-label="Add to cart"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
