import mongoose from 'mongoose';
import dbConnect from './lib/db';
import Product from './models/Product';

async function fix() {
    await dbConnect();
    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);

    for (const prod of products) {
        // Trigger the pre-save hook which now appends the ID
        console.log(`Updating slug for: ${prod.name}`);
        await prod.save();
        console.log(`New slug: ${prod.slug}`);
    }

    console.log('Fixed all products.');
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
