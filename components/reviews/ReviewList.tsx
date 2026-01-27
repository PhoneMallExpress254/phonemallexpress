"use client";

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { CheckCircle2 } from 'lucide-react';

interface Review {
    _id: string;
    userName: string;
    rating: number;
    title: string;
    review: string;
    verifiedPurchase: boolean;
    createdAt: string;
}

interface ReviewListProps {
    productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`);
                const data = await res.json();

                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    if (loading) return <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review._id} className="review-item">
                    <div className="review-header">
                        <div className="review-author">
                            <span>{review.userName}</span>
                            {review.verifiedPurchase && (
                                <span className="verified-badge">
                                    <CheckCircle2 size={12} /> Verified Purchase
                                </span>
                            )}
                        </div>
                        <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="review-rating">
                        <StarRating rating={review.rating} size={14} />
                    </div>

                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-content">{review.review}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
