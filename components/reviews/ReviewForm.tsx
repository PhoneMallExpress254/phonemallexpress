"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface ReviewFormProps {
    productId: string;
}

const ReviewForm = ({ productId }: ReviewFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        rating: 0,
        title: '',
        review: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId,
                    ...formData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success('Review submitted successfully! Pending approval.');
            setFormData({
                userName: '',
                userEmail: '',
                rating: 0,
                title: '',
                review: ''
            });

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h3 className="review-form-title">Write a Review</h3>

            <div className="form-group">
                <label>Rating</label>
                <div className="flex items-center gap-2">
                    <StarRating
                        rating={formData.rating}
                        size={24}
                        interactive={true}
                        onRatingChange={handleRatingChange}
                    />
                    {formData.rating > 0 && <span className="text-sm text-muted-foreground">{formData.rating} Stars</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 form-group">
                <div>
                    <label htmlFor="userName">Name</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label htmlFor="userEmail">Email</label>
                    <input
                        type="email"
                        id="userEmail"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="title">Review Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Summary of your experience"
                />
            </div>

            <div className="form-group">
                <label htmlFor="review">Review</label>
                <textarea
                    id="review"
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us what you liked or disliked..."
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
