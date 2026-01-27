"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    category: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (itemId: string) => void;
    isInWishlist: (itemId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load wishlist from local storage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (error) {
                console.error("Failed to parse wishlist from local storage", error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isLoaded]);

    const addToWishlist = (item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            toast.error('Item already in wishlist');
            return;
        }
        setWishlist(prev => [...prev, item]);
        toast.success('Added to wishlist');
    };

    const removeFromWishlist = (itemId: string) => {
        setWishlist(prev => prev.filter(item => item.id !== itemId));
        toast.success('Removed from wishlist');
    };

    const isInWishlist = (itemId: string) => {
        return wishlist.some(item => item.id === itemId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
