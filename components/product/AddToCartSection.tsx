"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartSectionProps {
    product: {
        _id: string;
        name: string;
        price: number;
        slug: string;
        category: string;
        image: string;
    };
    variants?: any[];
    storageVariants?: any[];
    warrantyVariants?: any[];
    simVariants?: any[];
    colors?: string[];
}

const AddToCartSection = ({
    product,
    variants = [],
    storageVariants = [],
    warrantyVariants = [],
    simVariants = [],
    colors = []
}: AddToCartSectionProps) => {
    const [quantity, setQuantity] = useState(1);

    // Legacy support
    const [selectedVariant, setSelectedVariant] = useState<any>(variants && variants.length > 0 ? variants[0] : null);

    // Grouped selections
    const [selectedStorage, setSelectedStorage] = useState<any>(storageVariants.find(v => !v.isDisabled) || null);
    const [selectedWarranty, setSelectedWarranty] = useState<any>(warrantyVariants.find(v => !v.isDisabled) || null);
    const [selectedSim, setSelectedSim] = useState<any>(simVariants.find(v => !v.isDisabled) || null);

    const [selectedColor, setSelectedColor] = useState<string>(colors && colors.length > 0 ? colors[0] : '');
    const { addToCart } = useCart();

    const currentPrice = selectedStorage
        ? (selectedStorage.salePrice || selectedStorage.price)
        : (selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price);

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        const variantOptions = [];
        if (selectedStorage) variantOptions.push(selectedStorage.name);
        if (selectedWarranty) variantOptions.push(selectedWarranty.name);
        if (selectedSim) variantOptions.push(selectedSim.name);
        if (selectedVariant && !selectedStorage) variantOptions.push(selectedVariant.name);

        addToCart({
            id: product._id,
            name: product.name,
            price: currentPrice,
            quantity: quantity,
            image: product.image,
            slug: product.slug,
            category: product.category,
            variant: variantOptions.join(' / ') || undefined,
            color: selectedColor || undefined
        });
    };

    return (
        <div className="product-actions-wrapper">
            {/* Storage Variants */}
            {storageVariants && storageVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Storage</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {storageVariants.filter(v => !v.isDisabled).map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedStorage(v)}
                                className={`variant-btn ${selectedStorage === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedStorage === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedStorage === v ? 'var(--accent)' : 'transparent',
                                    color: selectedStorage === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} - KSh {(v.salePrice || v.price).toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Warranty Variants */}
            {warrantyVariants && warrantyVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Warranty</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {warrantyVariants.filter(v => !v.isDisabled).map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedWarranty(v)}
                                className={`variant-btn ${selectedWarranty === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedWarranty === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedWarranty === v ? 'var(--accent)' : 'transparent',
                                    color: selectedWarranty === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* SIM Variants */}
            {simVariants && simVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>SIM Card Slots</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {simVariants.filter(v => !v.isDisabled).map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedSim(v)}
                                className={`variant-btn ${selectedSim === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedSim === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedSim === v ? 'var(--accent)' : 'transparent',
                                    color: selectedSim === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Legacy Variants (Price changes based on selection) */}
            {variants && variants.length > 0 && !selectedStorage && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Options</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {variants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedVariant(v)}
                                className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedVariant === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedVariant === v ? 'var(--accent)' : 'transparent',
                                    color: selectedVariant === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} - KSh {(v.salePrice || v.price).toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Colors */}
            {colors && colors.length > 0 && (
                <div className="colors-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Color</h4>
                    <div className="colors-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {colors.map((c, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedColor(c)}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedColor === c ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedColor === c ? 'var(--secondary)' : 'transparent',
                                    color: selectedColor === c ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="atc-quantity-row">
                <div className="quantity-input-container">
                    <button
                        className="qty-btn"
                        aria-label="Decrease quantity"
                        onClick={() => handleQuantityChange('dec')}
                    >
                        <span style={{ fontSize: '20px', fontWeight: 700 }}>−</span>
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                        className="qty-btn"
                        aria-label="Increase quantity"
                        onClick={() => handleQuantityChange('inc')}
                    >
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>+</span>
                    </button>
                </div>
                <button
                    className="btn btn-primary buy-now-btn"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart size={18} />
                    Add to cart
                </button>
            </div>

            <button className="btn btn-outline" style={{ background: '#d97706', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Questions? Request a Call Back
            </button>
        </div>
    );
};

export default AddToCartSection;
