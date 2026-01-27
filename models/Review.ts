import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: String,
        default: null
    },
    userName: {
        type: String,
        required: [true, 'Please provide your name']
    },
    userEmail: {
        type: String,
        required: [true, 'Please provide your email']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: [true, 'Please provide a review title'],
        maxlength: 100
    },
    review: {
        type: String,
        required: [true, 'Please provide a review'],
        maxlength: 1000
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
