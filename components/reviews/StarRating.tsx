"use client";

import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

const StarRating = ({
    rating,
    maxStars = 5,
    size = 16,
    interactive = false,
    onRatingChange
}: StarRatingProps) => {

    const handleStarClick = (index: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-0.5" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {Array.from({ length: maxStars }).map((_, i) => {
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 !== 0;

                let isFilled = i < fullStars;
                let isHalf = false;

                if (i === fullStars && hasHalfStar) {
                    isHalf = true;
                }

                return (
                    <div
                        key={i}
                        onClick={() => handleStarClick(i)}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            color: (isFilled || isHalf) ? '#fbbf24' : '#e5e7eb', // amber-400 : gray-200
                        }}
                    >
                        {isHalf ? (
                            <div style={{ position: 'relative' }}>
                                <Star
                                    size={size}
                                    fill="#e5e7eb"
                                    strokeWidth={0}
                                />
                                <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: '50%' }}>
                                    <Star
                                        size={size}
                                        fill="#fbbf24"
                                        strokeWidth={0}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Star
                                size={size}
                                fill={isFilled ? "currentColor" : "none"}
                                stroke={isFilled ? "none" : "#9ca3af"}
                                strokeWidth={isFilled ? 0 : 1.5}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;
