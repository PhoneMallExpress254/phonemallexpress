import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
    };
    items: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        variant?: string;
        color?: string;
    }>;
    totalAmount: number;
    currency: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentMethod: 'M-Pesa' | 'Card' | 'Cash';
    paymentStatus: 'Pending' | 'Completed' | 'Failed';
    mpesaDetails?: {
        checkoutRequestId?: string;
        merchantRequestId?: string;
        receiptNumber?: string;
        phoneNumber?: string;
        transactionDate?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
        },
        items: [
            {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                variant: { type: String },
                color: { type: String },
            },
        ],
        totalAmount: { type: Number, required: true },
        currency: { type: String, default: 'KES' },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentMethod: {
            type: String,
            enum: ['M-Pesa', 'Card', 'Cash'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
        mpesaDetails: {
            checkoutRequestId: { type: String },
            merchantRequestId: { type: String },
            receiptNumber: { type: String },
            phoneNumber: { type: String },
            transactionDate: { type: Date },
        },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
