"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import './MobileSearch.css';

const MobileSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/accessories?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="mobile-search-container">
            <form onSubmit={handleSearch} className="mobile-search-form">
                <input
                    type="text"
                    placeholder="Search for accessories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mobile-search-input"
                />
                <button type="submit" className="mobile-search-btn" aria-label="Search">
                    <Search size={20} />
                </button>
            </form>
        </div>
    );
};

export default MobileSearch;
