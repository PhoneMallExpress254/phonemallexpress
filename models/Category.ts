import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    parent?: mongoose.Types.ObjectId;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

// Indexing handled by unique: true on slug

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
