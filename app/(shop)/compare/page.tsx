"use client";

import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import './compare.css';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();

    const specRows = useMemo(() => {
        const rows: Record<string, Record<string, string>> = {};

        // Define standard groups and triggers (keywords)
        const keyMap: Record<string, string[]> = {
            'Display': ['display', 'screen', 'resolution', 'panel'],
            'Processor': ['processor', 'cpu', 'chipset', 'chip'],
            'Memory (RAM)': ['ram', 'memory'],
            'Storage': ['storage', 'rom', 'capacity'],
            'Camera': ['camera', 'cam', 'lens', 'photo'],
            'Battery': ['battery', 'power', 'mah', 'charging'],
            'Operating System': ['os', 'operating system', 'platform', 'android', 'ios'],
            'Connectivity': ['connectivity', 'network', 'sim', 'wifi', 'bluetooth', 'connection'],
            'Sensors': ['sensor', 'fingerprint', 'face id'],
            'Audio': ['sound', 'speaker', 'audio', 'jack'],
        };

        const standardKeys = Object.keys(keyMap);

        // Pre-initialize standard rows to maintain order
        standardKeys.forEach(k => rows[k] = {});

        compareList.forEach(product => {
            if (!product.specifications) return;

            Object.entries(product.specifications).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();

                // Find matching group
                let matchedGroup = standardKeys.find(stdKey =>
                    keyMap[stdKey].some(term => lowerKey.includes(term))
                );

                // Use original key if no group matched (capitalized nicely)
                if (!matchedGroup) {
                    matchedGroup = key.charAt(0).toUpperCase() + key.slice(1);
                }

                if (!rows[matchedGroup]) rows[matchedGroup] = {};

                // If value exists, append
                if (rows[matchedGroup][product._id]) {
                    const label = key.toLowerCase() !== matchedGroup.toLowerCase() ? `${key}: ` : '';
                    rows[matchedGroup][product._id] += `\n${label}${value}`;
                } else {
                    const isFuzzy = standardKeys.includes(matchedGroup);
                    const label = isFuzzy && !lowerKey.includes(matchedGroup.toLowerCase()) ? `${key}: ` : '';
                    rows[matchedGroup][product._id] = value;
                }
            });
        });

        // Return non-empty rows
        return Object.entries(rows).filter(([, pValues]) => Object.keys(pValues).length > 0);
    }, [compareList]);

    if (compareList.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Compare Products</h1>
                <p>No products selected for comparison.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', alignItems: 'center', justifyContent: 'center', display: 'inline-flex' }}>
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container compare-page">
            <div className="compare-header">
                <h1>Compare Products ({compareList.length})</h1>
                <button onClick={clearCompare} className="btn-link text-danger">
                    Clear All <Trash2 size={16} style={{ display: 'inline' }} />
                </button>
            </div>

            <div className="compare-table-wrapper">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="feature-label">Feature</th>
                            {compareList.map(product => (
                                <th key={product._id} className="product-col">
                                    <div className="compare-product-header">
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCompare(product._id)}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="product-thumb">
                                            <Image
                                                src={product.images?.[0]?.url || product.imageUrl || '/placeholder.png'}
                                                alt={product.name}
                                                width={120}
                                                height={120}
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <Link href={`/accessories/${typeof product.category === 'string' ? 'product' : product.category.slug}/${product.slug}`} className="product-title">
                                            {product.name}
                                        </Link>
                                        <div className="product-price">
                                            KSh {product.salePrice || product.price}
                                        </div>
                                        <button
                                            className="btn btn-sm btn-primary add-cart-btn"
                                            onClick={() => addToCart({
                                                id: product._id,
                                                name: product.name,
                                                price: product.salePrice || product.price,
                                                quantity: 1,
                                                image: product.imageUrl || '',
                                                slug: product.slug,
                                                category: typeof product.category === 'string' ? product.category : product.category.name
                                            })}
                                        >
                                            <ShoppingCart size={14} /> Add
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="feature-label">Brand</td>
                            {compareList.map(product => (
                                <td key={product._id}>{product.brand || '-'}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="feature-label">Category</td>
                            {compareList.map(product => (
                                <td key={product._id}>
                                    {typeof product.category === 'string' ? product.category : product.category.name}
                                </td>
                            ))}
                        </tr>
                        {/* Dynamic Specifications */}
                        {specRows.map(([feature, pValues]) => (
                            <tr key={feature}>
                                <td className="feature-label">{feature}</td>
                                {compareList.map(product => (
                                    <td key={product._id} style={{ whiteSpace: 'pre-line' }}>{pValues[product._id] || '-'}</td>
                                ))}
                            </tr>
                        ))}
                        <tr>
                            <td className="feature-label">Key Features</td>
                            {compareList.map(product => (
                                <td key={product._id}>
                                    <ul className="text-sm list-disc pl-4">
                                        {product.features ? Object.values(product.features).slice(0, 3).map((f, i) => (
                                            <li key={i}>{f}</li>
                                        )) : '-'}
                                    </ul>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
