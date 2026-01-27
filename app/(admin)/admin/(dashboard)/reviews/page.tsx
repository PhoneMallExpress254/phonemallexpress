'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/review/StarRating';

interface Review {
    _id: string;
    productName: string;
    productImage: string;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    review: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const statusParam = filter === 'all' ? '' : `?status=${filter}`;
            const res = await fetch(`/api/admin/reviews${statusParam}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, status: newStatus })
            });

            if (res.ok) {
                setReviews(prev => prev.filter(r => r._id !== reviewId));
                if (filter === 'all' || filter === newStatus) {
                    fetchReviews();
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div style={{ color: 'white' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '2.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>Review Management</h1>

            <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            background: filter === status ? 'var(--accent)' : '#111',
                            color: filter === status ? 'white' : '#888',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            border: '1px solid',
                            borderColor: filter === status ? 'var(--accent)' : '#222',
                            boxShadow: filter === status ? '0 4px 12px hsla(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.3)' : 'none'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ color: '#888' }}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div style={{ padding: '3rem', background: '#0a0a0a', borderRadius: '12px', textAlign: 'center', color: '#888', border: '1px solid #222' }}>
                    No reviews found matching "{filter}"
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((review) => (
                        <div key={review._id} style={{
                            background: '#0a0a0a',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #222'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>
                                        Product: <strong style={{ color: '#ccc' }}>{review.productName}</strong>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                        {review.title}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background:
                                        review.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' :
                                            review.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                    color:
                                        review.status === 'approved' ? '#10b981' :
                                            review.status === 'rejected' ? '#ef4444' : '#eab308'
                                }}>
                                    {review.status.toUpperCase()}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <StarRating rating={review.rating} readonly size="small" />
                            </div>

                            <p style={{ color: '#ccc', lineHeight: '1.6', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>
                                {review.review}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #1a1a1a', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    By: <span style={{ color: '#ccc', fontWeight: 600 }}>{review.userName}</span> <span style={{ color: '#444' }}>({review.userEmail})</span>
                                </div>

                                {review.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 200px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                                            style={{
                                                flex: 1,
                                                maxWidth: '120px',
                                                padding: '10px 18px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#22c55e',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                boxShadow: '0 4px 10px rgba(34, 197, 94, 0.2)'
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                                            style={{
                                                flex: 1,
                                                maxWidth: '120px',
                                                padding: '10px 18px',
                                                borderRadius: '8px',
                                                border: '1px solid #ef4444',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
