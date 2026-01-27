import { z } from 'zod';

export const SignInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const MpesaPaymentSchema = z.object({
    customer: z.object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(/^(?:\+254|0)?7\d{8}$/, 'Invalid Kenyan phone number'),
        address: z.string().min(5, 'Address is too short')
    }),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        variant: z.string().optional(),
        color: z.string().optional()
    })).min(1, 'Cart cannot be empty'),
    totalAmount: z.number().positive('Total amount must be positive')
});

export const ProductSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    price: z.number().positive(),
    salePrice: z.number().optional(),
    category: z.string().min(2),
    stock: z.number().int().min(0),
    isFeatured: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    colors: z.array(z.string()).optional(),
    features: z.record(z.string(), z.any()).optional()
});
