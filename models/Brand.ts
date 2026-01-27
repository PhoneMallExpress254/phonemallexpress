import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
}

const BrandSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String },
    description: { type: String },
}, { timestamps: true });

// Indexing handled by unique: true on slug

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
