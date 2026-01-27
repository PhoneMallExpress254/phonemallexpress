"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string;
    images?: { url: string }[];
    slug: string;
    category: string | { name: string; slug: string };
    itemType?: string;
    brand?: string;
    specifications?: Record<string, string>;
    features?: Record<string, string>;
    isOnSpecialOffer?: boolean;
    discountPercentage?: number;
}

interface CompareContextType {
    compareList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareList, setCompareList] = useState<Product[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: Product) => {
        if (compareList.some(p => p._id === product._id)) {
            toast.error("Product already in compare list");
            return;
        }

        if (compareList.length >= 3) {
            toast.error("You can only compare up to 3 products");
            return;
        }

        // Check category compatibility (optional, but good UX)
        if (compareList.length > 0) {
            // Simplify category check: try to match simple string or object name
            const currentCat = typeof product.category === 'string' ? product.category : product.category?.name;
            const firstCat = typeof compareList[0].category === 'string' ? compareList[0].category : compareList[0].category?.name;

            // Soft warning or strict? Let's just toast but allow for now as per plan "flexible".
            // Actually, comparing a Phone with a Charger makes no sense.
            // But let's keep it open for now as requested.
        }

        setCompareList([...compareList, product]);
        toast.success("Added to compare");
    };

    const removeFromCompare = (id: string) => {
        setCompareList(compareList.filter(p => p._id !== id));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (id: string) => {
        return compareList.some(p => p._id === id);
    };

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
