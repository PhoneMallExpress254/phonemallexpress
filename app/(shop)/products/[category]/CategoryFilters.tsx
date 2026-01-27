"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial States
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    // Debounce price
    useEffect(() => {
        const handler = setTimeout(() => {
            updateParams({ minPrice, maxPrice });
        }, 500);
        return () => clearTimeout(handler);
    }, [minPrice, maxPrice]);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const brands = ['Samsung', 'Apple', 'Xiaomi', 'Tecno', 'Infinix', 'Oppo', 'OnePlus', 'Google'];
    const colors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Grey'];
    const storage = ['64GB', '128GB', '256GB', '512GB', '1TB'];

    const [isOpen, setIsOpen] = useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 8000); // 8 seconds of inactivity
    };

    // Initial open timer
    useEffect(() => {
        if (isOpen) {
            startTimer();
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isOpen]);

    const handleInteraction = () => {
        if (isOpen) startTimer();
    };

    const handleToggle = (key: string, value: string) => {
        const current = searchParams.get(key);
        updateParams({ [key]: current === value ? null : value });
        handleInteraction();
    };

    return (
        <>
            <button
                className="mobile-filter-toggle"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'none', // Hidden on desktop by default via CSS
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--foreground)'
                }}
            >
                <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <aside
                className={`filters-card ${isOpen ? 'open' : ''}`}
                onClick={handleInteraction}
                onChange={handleInteraction}
                onKeyDown={handleInteraction}
                onTouchStart={handleInteraction}
                style={{
                    backgroundColor: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    position: 'sticky',
                    top: '160px',
                    // Mobile styles will be handled by CSS class 'open' or media queries ideally, 
                    // but since we are using inline styles for some parts, we need to be careful.
                    // I will add a className helper.
                }}
            >
                <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Filters</h2>

                {/* Brands */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Brand</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {brands.map(brand => {
                            const isSelected = searchParams.get('brand') === brand;
                            return (
                                <button
                                    key={brand}
                                    onClick={() => handleToggle('brand', brand)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        borderRadius: '8px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                        color: isSelected ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {brand}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Subcategory / Type */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Accessory Type</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[
                            { id: 'chargers', label: 'Chargers' },
                            { id: 'powerbanks', label: 'Powerbanks' },
                            { id: 'cables', label: 'Cables' },
                            { id: 'protectors', label: 'Screen Protectors' },
                            { id: 'covers', label: 'Phone Covers' },
                            { id: 'streamers', label: 'Streamers' },
                            { id: 'flashdrives', label: 'Flash Drives' },
                            { id: 'gimbals', label: 'Gimbals' },
                            { id: 'harddisks', label: 'Hard Disks' },
                            { id: 'memorycards', label: 'Memory Cards' },
                            { id: 'modems', label: 'Modems' },
                            { id: 'mouse', label: 'Mouse' }
                        ].map(item => {
                            const isSelected = searchParams.get('type') === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggle('type', item.id)}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '11px',
                                        borderRadius: '6px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                                        color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range (KES)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '8px', fontSize: '13px' }}
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '8px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* Colors */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Color</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {colors.map(color => {
                            const isSelected = searchParams.get('color') === color;
                            return (
                                <button
                                    key={color}
                                    onClick={() => handleToggle('color', color)}
                                    style={{
                                        padding: '6px',
                                        fontSize: '11px',
                                        borderRadius: '6px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                                        color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
                                        textAlign: 'center'
                                    }}
                                >
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Storage */}
                <div className="filter-group">
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Storage</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {storage.map(opt => {
                            const isSelected = searchParams.get('storage') === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleToggle('storage', opt)}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '11px',
                                        borderRadius: '6px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                                        color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)'
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    className="mobile-close-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                >
                    Filter
                </button>

                <button
                    onClick={() => router.push(window.location.pathname)}
                    style={{ marginTop: '12px', fontSize: '12px', textDecoration: 'underline', color: 'var(--muted-foreground)', display: 'block', width: '100%' }}
                >
                    Clear all filters
                </button>
            </aside>
        </>
    );
}
