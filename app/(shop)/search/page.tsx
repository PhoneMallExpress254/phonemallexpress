"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Search } from 'lucide-react';

import Pagination from '@/components/ui/Pagination';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const page = Number(searchParams.get('page')) || 1;
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ totalPages: 0, totalCount: 0 });

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
                const data = await res.json();
                setProducts(data.products || []);
                setPagination({
                    totalPages: data.totalPages || 0,
                    totalCount: data.totalCount || 0
                });
            } catch (error) {
                console.error('Search error:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, page]);

    return (
        <div className="container" style={{ paddingTop: '0.15rem', paddingBottom: 'var(--spacing-lg)' }} suppressHydrationWarning={true}>
            <Breadcrumbs items={[{ label: 'Search', href: '/search' }]} />

            <div style={{ marginTop: '0.125rem', marginBottom: products.length > 0 ? '0.5rem' : 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0' }}>
                    <Search size={24} style={{ color: 'var(--accent)' }} />
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                        Search Results
                    </h1>
                </div>
                {query && (
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-sm)' }}>
                        Showing results for: <strong style={{ color: 'var(--foreground)' }}>"{query}"</strong>
                    </p>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--muted-foreground)' }}>
                    <p>Searching...</p>
                </div>
            ) : products.length > 0 ? (
                <>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--spacing-md)' }}>
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                    />
                </>
            ) : query ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted-foreground)' }}>
                    <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                        No results found
                    </h3>
                    <p style={{ marginBottom: '1rem', fontSize: 'var(--font-size-sm)' }}>
                        We couldn't find any products matching "{query}"
                    </p>
                    <Link href="/accessories" className="btn btn-primary">
                        Browse All Products
                    </Link>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted-foreground)' }}>
                    <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>Enter a search term to find products</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                <p>Loading Search...</p>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
