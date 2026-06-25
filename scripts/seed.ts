/**
 * Seed script: loads the combined product catalog (batch1: original mixed
 * electronics catalog, batch2: UGREEN accessories pricelist) into MongoDB
 * via the Product model.
 *
 * Usage:
 *   bun run seed
 *
 * Requires MONGODB_URI to be set (e.g. in .env.local). This script is
 * idempotent: products are matched by exact `name` and updated in place if
 * they already exist, so it is safe to re-run.
 */
import connectDB from '../lib/db';
import Product from '../models/Product';
import batch1 from './seed-data/batch1_products.json';
import batch2 from './seed-data/batch2_products.json';

interface SeedProduct {
    name: string;
    description: string;
    price: number;
    brand?: string | null;
    category: string;
    subcategory?: string | null;
    imageUrl?: string;
    images?: string[];
    stock?: number;
    isFeatured?: boolean;
    status?: string;
    isOnSpecialOffer?: boolean;
    _source?: unknown;
}

const VALID_CATEGORIES = new Set([
    'Phones', 'Tablets', 'Laptops', 'Audio', 'Gaming', 'Smartwatches',
    'Accessories', 'TVs', 'Computing', 'Cameras', 'Networking', 'Storage',
    'Refrigerators', 'Washing Machines', 'Kitchen ware', 'Other',
]);

async function seed() {
    await connectDB();

    const all = [...(batch1 as SeedProduct[]), ...(batch2 as SeedProduct[])];
    console.log(`Loaded ${all.length} products from seed data (batch1: ${batch1.length}, batch2: ${batch2.length}).`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const raw of all) {
        const { _source, ...doc } = raw as SeedProduct & { _source?: unknown };

        if (!doc.name || !doc.description || typeof doc.price !== 'number' || !doc.category) {
            console.warn(`Skipping invalid product (missing a required field): ${doc.name ?? '(no name)'}`);
            skipped++;
            continue;
        }

        if (!VALID_CATEGORIES.has(doc.category)) {
            console.warn(`Skipping "${doc.name}" - invalid category "${doc.category}"`);
            skipped++;
            continue;
        }

        const existing = await Product.findOne({ name: doc.name });
        if (existing) {
            await Product.updateOne({ _id: existing._id }, { $set: doc });
            updated++;
        } else {
            await Product.create(doc);
            created++;
        }
    }

    console.log(`Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Total processed: ${all.length}`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
