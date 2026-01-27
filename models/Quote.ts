import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: [true, 'Please provide organization name'],
        maxlength: 100
    },
    contactPerson: {
        type: String,
        required: [true, 'Please provide contact person name'],
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
    },
    requirements: {
        type: String,
        required: [true, 'Please list your requirements'],
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Archived'],
        default: 'Pending'
    }
}, { timestamps: true });

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
