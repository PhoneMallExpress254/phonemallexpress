import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
    }
}, { timestamps: true });

// Prevent recompilation of model in Next.js hot reload
export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
