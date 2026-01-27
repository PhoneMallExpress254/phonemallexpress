"use client";

import { ArrowRightLeft } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import './CompareButton.css';

interface Product {
    _id: string;
    name: string;
    price: number;
    slug: string;
    category: string | { name: string; slug: string };
    [key: string]: any;
}

export default function CompareButton({ product, className = '' }: { product: Product, className?: string }) {
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const isActive = isInCompare(product._id);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isActive) {
            removeFromCompare(product._id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <button
            className={`compare-btn ${isActive ? 'active' : ''} ${className}`}
            onClick={handleClick}
            title={isActive ? "Remove from compare" : "Add to compare"}
            aria-label="Compare product"
        >
            <ArrowRightLeft size={18} />
        </button>
    );
}
