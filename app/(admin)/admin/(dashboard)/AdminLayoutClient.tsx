'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './admin-layout.module.css';

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await fetch('/api/admin/reviews?status=pending');
                const data = await res.json();
                if (data.success && Array.isArray(data.reviews)) {
                    setPendingReviewsCount(data.reviews.length);
                }
            } catch (error) {
                console.error('Failed to fetch pending reviews count', error);
            }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className={styles.container}>
            <div
                className={`${styles.overlay} ${isSidebarOpen ? styles.visible : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    PHONEMALL<span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>EXPRESS Admin</span>
                </div>

                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.link} onClick={() => setIsSidebarOpen(false)}>📊 Dashboard</Link>
                    <Link href="/admin/products" className={styles.link} onClick={() => setIsSidebarOpen(false)}>📦 Products</Link>
                    <Link href="/admin/reviews" className={styles.link} onClick={() => setIsSidebarOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⭐ Reviews</span>
                        {pendingReviewsCount > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                marginLeft: '8px'
                            }}>
                                {pendingReviewsCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/admin/register" className={styles.link} onClick={() => setIsSidebarOpen(false)}>👥 Register Admin</Link>
                    <Link href="/admin/orders" className={styles.link} onClick={() => setIsSidebarOpen(false)}>🚚 Orders</Link>
                    <Link href="/admin/quotes" className={styles.link} onClick={() => setIsSidebarOpen(false)}>📋 Bulk Quotes</Link>

                    <div className={styles.footer}>
                        <Link href="/" className={styles.link} style={{ fontSize: '0.85rem', color: '#888' }}>
                            ↪ Back to Shop
                        </Link>
                        <button
                            onClick={handleLogout}
                            className={styles.link}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f44336',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem'
                            }}
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.mobileHeader}>
                    <button
                        className={styles.hamburgerBtn}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <span className={styles.logo}>PHONEMALL Admin</span>
                    <div style={{ width: '32px' }}></div>
                </header>
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
