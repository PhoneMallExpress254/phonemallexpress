'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import CustomImageUploader from '@/components/admin/CustomImageUploader';
import MultiImageUploader from '@/components/admin/MultiImageUploader';

interface FeatureObj {
    key: string;
    value: string;
}


const categorySubcategoryMap: Record<string, string[]> = {
    'Phones': ['Smartphones', 'Feature Phones', 'Refurbished'],
    'Tablets': ['Apple iPad', 'Samsung Tablets', 'Tecno Tablets', 'Redmi Tablets', 'Xiaomi Tablets'],
    'Audio': ['Buds', 'Earphones', 'Headphones', 'Soundbar', 'Speakers'],
    'Gaming': ['Gaming Consoles', 'PlayStation Games', 'Gaming Controller', 'Gaming Headsets'],
    'Refrigerators': ['Side by side', 'Single door', 'Double door'],
    'Washing Machines': ['Top load', 'Front load'],
    'Kitchen ware': ['Cookers', 'Airfryers', 'Blenders', 'Electric kettles'],
    'TVs': ['Smart TVs', 'Android TVs', '4K UHD TVs', 'Tv Accessories'],
    'Cameras': ['Digital Cameras', 'Security Cameras', 'Camera Accessories'],
    'Other': ['General']
};

// ------------------------------------------------------------------
// HELPERS & PARSERS (Hoisted)
// ------------------------------------------------------------------
const KNOWN_SPEC_KEYS = [
    'Model Name', 'Network Technology', 'Launch', 'Body', 'Display Type', 'Display Size', 'Display Resolution',
    'Display', 'Platform', 'Memory', 'Internal Storage', 'Card Slot',
    'Main Camera', 'Selfie Camera', 'Sound', 'Comms', 'Features', 'Battery Capacity', 'Battery', 'Misc',
    'Dimensions', 'Weight', 'Build', 'SIM', 'Type', 'Size', 'Resolution', 'Operating System', 'OS', 'Chipset', 'CPU', 'GPU',
    'Card slot', 'Internal', 'Single', 'Dual', 'Triple', 'Quad', 'Sensors', 'Charging', 'Colors', 'Price',
    'Rear Camera', 'Front Camera', 'FM Radio', 'Bluetooth', 'Audio Jack', 'USB Port', 'Torch', 'Extras', 'WLAN'
];

const parseKeyFeatures = (text: string): FeatureObj[] => {
    if (!text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const newRows: FeatureObj[] = [];

    lines.forEach(line => {
        const cleanLine = line.replace(/^[\s\-\•\*]+/, '').trim();
        if (!cleanLine) return;

        let key = 'Feature';
        let value = cleanLine;

        // Handle "Key: Value"
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex !== -1 && colonIndex < 30) {
            key = cleanLine.substring(0, colonIndex).trim();
            value = cleanLine.substring(colonIndex + 1).trim();
        } else {
            // Heuristics for bullet points without colons
            const lower = cleanLine.toLowerCase();
            if (lower.includes('display') || lower.includes('screen') || lower.includes('inch')) key = 'Display';
            else if (lower.includes('battery') || lower.includes('mah')) key = 'Battery';
            else if (lower.includes('camera') || lower.includes('mp')) key = 'Camera';
            else if (lower.includes('ram') || lower.includes('storage') || lower.includes('gb') || lower.includes('tb')) key = 'Memory';
            else if (lower.includes('processor') || lower.includes('cpu') || lower.includes('ghz')) key = 'Processor';
            else if (lower.includes('android') || lower.includes('ios')) key = 'OS';
            else if (lower.includes('sim')) key = 'SIM';
            else if (lower.includes('network')) key = 'Network';
            else if (lower.includes('bluetooth') || lower.includes('wifi') || lower.includes('usb')) key = 'Connectivity';
        }

        key = key.replace(/^"/, '').replace(/"$/, '');
        value = value.replace(/^"/, '').replace(/"$/, '');

        if (key && value) newRows.push({ key, value });
    });

    return newRows;
};

const parseTechnicalSpecs = (text: string): FeatureObj[] => {
    if (!text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const newRows: FeatureObj[] = [];

    let pendingKey = '';
    let pendingValue = '';

    const flushPending = () => {
        if (pendingKey) {
            newRows.push({ key: pendingKey, value: pendingValue.trim() });
            pendingKey = '';
            pendingValue = '';
        }
    };

    lines.forEach(line => {
        const cleanLine = line.replace(/^[\s\-\•\*]+/, '').trim();

        const matchedKey = KNOWN_SPEC_KEYS.sort((a, b) => b.length - a.length)
            .find(k => cleanLine.toLowerCase().startsWith(k.toLowerCase()));

        if (matchedKey) {
            flushPending();
            pendingKey = matchedKey;
            let remainder = cleanLine.substring(matchedKey.length).trim();
            // Remove leading colon if present
            if (remainder.startsWith(':') || remainder.startsWith('-')) remainder = remainder.substring(1).trim();
            // If the remainder is just the key name (tabbed), handle that (common in copypaste from tables)
            if (!remainder && line.includes('\t')) {
                // Try to get value after tab
                const parts = line.split('\t');
                if (parts.length > 1) remainder = parts[1];
            }
            pendingValue = remainder;
        } else {
            const colonIndex = cleanLine.indexOf(':');
            if (colonIndex !== -1 && colonIndex < 40) {
                flushPending();
                pendingKey = cleanLine.substring(0, colonIndex).trim();
                pendingValue = cleanLine.substring(colonIndex + 1).trim();
            } else {
                if (pendingKey) {
                    pendingValue = pendingValue ? pendingValue + ' ' + cleanLine : cleanLine;
                } else {
                    // If no key yet, treat as "General" only if it looks like a spec
                    if (cleanLine.includes('GB') || cleanLine.includes('mAh') || cleanLine.includes('MHz')) {
                        newRows.push({ key: 'General', value: cleanLine });
                    }
                }
            }
        }
    });

    flushPending();
    return newRows;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        minPrice: '',
        maxPrice: '',
        category: 'Phones',
        subcategory: '',
        description: '',
        stock: '',
        image: '',
        youtubeVideoUrl: ''
    });

    const [features, setFeatures] = useState<FeatureObj[]>([{ key: '', value: '' }]);
    const [specifications, setSpecifications] = useState<FeatureObj[]>([{ key: '', value: '' }]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isOnSpecialOffer, setIsOnSpecialOffer] = useState(false);
    const [salePrice, setSalePrice] = useState('');
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [hasVariants, setHasVariants] = useState(false);

    // Grouped Variants State
    const [variantTypes, setVariantTypes] = useState({
        storage: false,
        warranty: false,
        sim: false
    });
    const [storageVariants, setStorageVariants] = useState<{ name: string; price: string; salePrice: string; stock: string; isDisabled: boolean }[]>([]);
    const [warrantyVariants, setWarrantyVariants] = useState<{ name: string; stock: string; isDisabled: boolean }[]>([]);
    const [simVariants, setSimVariants] = useState<{ name: string; stock: string; isDisabled: boolean }[]>([]);

    const [variants, setVariants] = useState<{ name: string; price: string; stock: string }[]>([]);
    const [status, setStatus] = useState<'published' | 'draft'>('published');
    const [smartPasteMode, setSmartPasteMode] = useState<{ features: boolean; specs: boolean }>({ features: false, specs: false });

    // Global Smart Parse State
    const [globalSmartPasteMode, setGlobalSmartPasteMode] = useState(false);
    const [globalRawText, setGlobalRawText] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products?id=${id}`);
                const data = await res.json();

                if (data.success && data.data) {
                    const p = data.data;
                    setFormData({
                        name: p.name,
                        brand: p.brand || '',
                        price: p.price,
                        minPrice: p.minPrice || '',
                        maxPrice: p.maxPrice || '',
                        category: typeof p.category === 'string' ? p.category : (p.category?.name || 'Phones'),
                        subcategory: p.subcategory || '',
                        description: p.description,
                        stock: p.stock,
                        image: p.imageUrl || p.images?.[0]?.url || '',
                        youtubeVideoUrl: p.youtubeVideoUrl || ''
                    });

                    setIsFeatured(p.isFeatured || false);
                    setStatus(p.status || 'published');
                    setColors(p.colors || []);
                    setGalleryImages(p.images || []);
                    setIsOnSpecialOffer(p.isOnSpecialOffer || false);
                    setSalePrice(p.salePrice ? p.salePrice.toString() : '');

                    if (p.variants && p.variants.length > 0) {
                        setHasVariants(true);
                        setVariants(p.variants.map((v: any) => ({
                            name: v.name,
                            price: v.price.toString(),
                            stock: v.stock.toString()
                        })));
                    }

                    if (p.storageVariants && p.storageVariants.length > 0) {
                        setHasVariants(true);
                        setVariantTypes(prev => ({ ...prev, storage: true }));
                        setStorageVariants(p.storageVariants.map((v: any) => ({
                            name: v.name,
                            price: v.price.toString(),
                            salePrice: v.salePrice ? v.salePrice.toString() : '',
                            stock: v.stock.toString(),
                            isDisabled: v.isDisabled || false
                        })));
                    }

                    if (p.warrantyVariants && p.warrantyVariants.length > 0) {
                        setHasVariants(true);
                        setVariantTypes(prev => ({ ...prev, warranty: true }));
                        setWarrantyVariants(p.warrantyVariants.map((v: any) => ({
                            name: v.name,
                            stock: v.stock.toString(),
                            isDisabled: v.isDisabled || false
                        })));
                    }

                    if (p.simVariants && p.simVariants.length > 0) {
                        setHasVariants(true);
                        setVariantTypes(prev => ({ ...prev, sim: true }));
                        setSimVariants(p.simVariants.map((v: any) => ({
                            name: v.name,
                            stock: v.stock.toString(),
                            isDisabled: v.isDisabled || false
                        })));
                    }



                    if (p.features && Object.keys(p.features).length > 0) {
                        setFeatures(Object.entries(p.features).map(([key, value]) => ({
                            key,
                            value: value as string
                        })));
                    }

                    if (p.specifications && Object.keys(p.specifications).length > 0) {
                        setSpecifications(Object.entries(p.specifications).map(([key, value]) => ({
                            key,
                            value: value as string
                        })));
                    }
                } else {
                    alert('Product not found');
                    router.push('/admin/products');
                }
            } catch (error) {
                console.error('Error fetching product', error);
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const featuresObject: Record<string, string> = {};
            features.forEach(f => {
                if (f.key.trim()) featuresObject[f.key.trim()] = f.value.trim();
            });

            const specsObject: Record<string, string> = {};
            specifications.forEach(s => {
                if (s.key.trim()) specsObject[s.key.trim()] = s.value.trim();
            });

            const payload = {
                _id: id,
                ...formData,
                imageUrl: formData.image,
                images: galleryImages,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                isOnSpecialOffer,
                salePrice: isOnSpecialOffer && salePrice ? Number(salePrice) : null,
                colors,
                variants: hasVariants ? variants.map(v => ({
                    name: v.name,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })) : [],
                storageVariants: hasVariants && variantTypes.storage ? storageVariants.map(v => ({
                    ...v,
                    price: Number(v.price) || 0,
                    salePrice: v.salePrice ? Number(v.salePrice) : null,
                    stock: Number(v.stock) || 0
                })) : [],
                warrantyVariants: hasVariants && variantTypes.warranty ? warrantyVariants.map(v => ({
                    ...v,
                    stock: Number(v.stock) || 0
                })) : [],
                simVariants: hasVariants && variantTypes.sim ? simVariants.map(v => ({
                    ...v,
                    stock: Number(v.stock) || 0
                })) : [],
                youtubeVideoUrl: formData.youtubeVideoUrl || null,
                status: status
            };

            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Failed to update product');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating product');
        } finally {
            setLoading(false);
        }
    };

    // Helper functions (omitted for brevity in this step, but would be include in a full file copy)
    // For now I'll include just what's needed for the UI to render.

    // Helper functions for dynamic lists
    const handleFeatureChange = (index: number, field: 'key' | 'value', val: string) => {
        const newFeatures = [...features];
        newFeatures[index][field] = val;
        setFeatures(newFeatures);
    };

    const addFeature = () => setFeatures([...features, { key: '', value: '' }]);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

    const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = val;
        setSpecifications(newSpecs);
    };

    const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
    const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));

    const handleColorAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (colorInput.trim() && !colors.includes(colorInput.trim())) {
                setColors([...colors, colorInput.trim()]);
                setColorInput('');
            }
        }
    };

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.includes(',')) {
            const split = val.split(',');
            const lastChunk = split.pop() || '';
            const newColorsToAdd = split.map(s => s.trim()).filter(s => s && !colors.includes(s));

            if (newColorsToAdd.length > 0) {
                setColors(prev => {
                    const uniqueNew = newColorsToAdd.filter(c => !prev.includes(c));
                    return [...prev, ...uniqueNew];
                });
            }
            setColorInput(lastChunk);
        } else {
            setColorInput(val);
        }
    };

    const removeColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove));
    };



    const handleGlobalSmartParse = () => {
        const text = globalRawText;
        if (!text.trim()) return;

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;

        // NOISE FILTERING
        const NOISE_INDICATORS = [
            'add to wishlist', 'add to compare', 'reviews (', 'in stock', 'out of stock',
            'sku:', 'brands:', 'tags:', 'category:', 'warranty', 'corporate customers',
            'phoneplace care', 'call us', 'nb:', 'buy now', 'east africa', 'uae', 'dubai',
            'watch video', 'brand:', 'model:', 'questions?', 'review'
        ];

        const cleanedLines = lines.filter(line => {
            const lower = line.toLowerCase();

            // 1. Explicit Strings
            if (NOISE_INDICATORS.some(indicator => lower.includes(indicator))) return false;

            // 2. Regex Patterns (Email, Phone-like digits with context)
            if (line.match(/@/)) return false; // Email
            if (line.match(/(?:\+|07)\d{2,}/)) return false; // Phone numbers roughly

            // 3. Specific User Cases
            // "iPhone 16 Series" -> If it ends in "Series" and is short, it's likely a tag or breadcrumb, NOT the product name (which is usually longer or specific)
            if (line.length < 30 && lower.endsWith('series')) return false;

            return true;
        });

        // 1. NAME Extraction
        let name = '';
        // Try strict first on cleaned lines
        for (let i = 0; i < Math.min(cleanedLines.length, 10); i++) {
            const line = cleanedLines[i];
            const lower = line.toLowerCase();
            if (
                lower.includes('ksh') || lower.includes('kes') ||
                line.length < 3
            ) {
                continue;
            }

            if (line.length < 150 && !line.includes(':')) {
                name = line;
                break;
            }
        }
        // Fallback: just take the first non-price line from cleaned lines
        if (!name) {
            for (let i = 0; i < Math.min(cleanedLines.length, 5); i++) {
                const line = cleanedLines[i];
                if (!line.match(/KSh|KES|Shs|UGX|US\s?\$|\d+%|Add to cart/i) && line.length > 2) {
                    name = line.substring(0, 150);
                    break;
                }
            }
        }

        // 2. BRAND Extraction
        let brand = '';
        // Explicit search
        const brandMatch = text.match(/^Brand:\s*(.+)$/im);
        if (brandMatch && brandMatch[1]) {
            brand = brandMatch[1].trim();
        } else {
            // Fallback to first word of name
            if (name) {
                const firstWord = name.split(' ')[0];
                if (firstWord && firstWord.length > 2) {
                    brand = firstWord;
                }
            }
        }

        // 3. PRICE Extraction
        // Supports: KSh 1,200 | KES 1,200 | Ksh. 1,200 | Shs 1,200 | US $100
        const priceRegex = /(?:KSh\.?|KES|Sh(?:s|illings)?\.?|UGX|US\s?\$)\s*([\d,]+)/gi;
        const prices: number[] = [];
        let match;
        const textWithPrices = text;
        while ((match = priceRegex.exec(textWithPrices)) !== null) {
            const numStr = match[1].replace(/,/g, '');
            const num = parseInt(numStr, 10);
            if (!isNaN(num)) prices.push(num);
        }

        let price = '';
        let salePriceVal = '';
        let isSpecial = false;

        if (prices.length > 0) {
            const uniquePrices = Array.from(new Set(prices)).sort((a, b) => b - a);
            if (uniquePrices.length >= 2) {
                price = uniquePrices[0].toString();
                salePriceVal = uniquePrices[uniquePrices.length - 1].toString();
                if (uniquePrices[0] > uniquePrices[uniquePrices.length - 1]) {
                    isSpecial = true;
                }
            } else {
                price = uniquePrices[0].toString();
            }
        }

        // 4. FEATURES
        let featuresRows: FeatureObj[] = [];
        const featuresMatch = text.match(/(?:Key Features|Features|Pros and Cons)(?:[:\s]*)([\s\S]*?)(?:Full Specifications|Specifications|Price and Availability|Technical Specifications|Description|Overview|$)/i);
        if (featuresMatch && featuresMatch[1]) {
            featuresRows = parseKeyFeatures(featuresMatch[1]);
        }

        // 5. SPECS
        let specsRows: FeatureObj[] = [];
        const specsMatch = text.match(/(?:Full Specifications|Technical Specifications|Specifications)(?:[:\s]*)([\s\S]*?)(?:Pros and Cons|related products|Key Features|Description|Overview|$)/i);
        if (specsMatch && specsMatch[1]) {
            specsRows = parseTechnicalSpecs(specsMatch[1]);
        }

        // 6. DESCRIPTION
        let description = '';
        // Explicit Description Header
        const descHeaderMatch = text.match(/(?:Description|Overview)(?:[:\s]*)([\s\S]*?)(?:Key Features|Features|Specifications|Full Specifications|Price and Availability|$)/i);
        if (descHeaderMatch && descHeaderMatch[1]) {
            // Filter out lines that look like table rows to avoid junk
            description = descHeaderMatch[1].split('\n')
                .filter(l => !l.includes('\t') && !l.match(/^\s*[\w\s]+:/)) // No tabs, no "Key:" lines
                .join('\n\n').trim();
        }

        if (!description) {
            const descMatch = text.match(/(?:Features:|in Kenya and Features:)([\s\S]*?)(?:Tecno|Samsung|Apple|Full Specifications|Specifications)/i);
            if (descMatch && descMatch[1]) {
                description = descMatch[1].split('\n').filter(l => l.length > 50).join('\n\n').trim();
            }
        }

        if (!description) {
            // Fallback: look for paragraphs > 30 chars (relaxed)
            const paragraphs = lines.filter(l =>
                l.length > 30 &&
                !l.includes('\t') &&
                !l.includes('KSh') &&
                !l.startsWith('Key Features') &&
                !l.match(/^\s*[\w\s]+:/) // No spec lines
            );
            if (paragraphs.length > 0) description = paragraphs.join('\n\n');
        }

        setFormData(prev => ({
            ...prev,
            name: name || prev.name,
            brand: brand || prev.brand,
            price: price || prev.price,
            description: description || prev.description
        }));

        if (salePriceVal) setSalePrice(salePriceVal);
        if (isSpecial) setIsOnSpecialOffer(true);
        if (featuresRows.length > 0) setFeatures(featuresRows);
        if (specsRows.length > 0) setSpecifications(specsRows);

        setGlobalSmartPasteMode(false);
        setGlobalRawText('');
    };

    const handleSmartPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, type: 'features' | 'specs') => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        if (!text) return;

        const lines = text.split('\n');
        const newItems: FeatureObj[] = [];
        lines.forEach(line => {
            // Support "Key: Value" or "Key - Value"
            let separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) separatorIndex = line.indexOf('-');

            if (separatorIndex !== -1) {
                const key = line.substring(0, separatorIndex).trim();
                const value = line.substring(separatorIndex + 1).trim();
                if (key && value) {
                    newItems.push({ key, value: value.replace(/^"/, '').replace(/"$/, '') }); // Remove wrapping quotes
                }
            }
        });

        if (newItems.length > 0) {
            if (type === 'features') {
                // Filter out empty placeholder if it exists and is the only item
                const current = features.length === 1 && !features[0].key ? [] : features;
                setFeatures([...current, ...newItems]);
            } else {
                const current = specifications.length === 1 && !specifications[0].key ? [] : specifications;
                setSpecifications([...current, ...newItems]);
            }
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem',
        background: '#111',
        border: '1px solid #333',
        borderRadius: '6px',
        color: 'white',
        marginTop: '0.25rem',
        outline: 'none',
        fontSize: '0.9rem'
    };

    const labelStyle = {
        display: 'block',
        marginTop: '1rem',
        color: '#ccc',
        fontSize: '0.85rem'
    };

    if (fetching) {
        return <div style={{ padding: '2rem', color: 'white' }}>Loading product details...</div>;
    }

    return (
        <div style={{ color: 'white', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Edit Product</h1>

                <button
                    type="button"
                    onClick={() => setGlobalSmartPasteMode(true)}
                    style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(45deg, #ff6b00, #ff9f00)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 10px rgba(255, 107, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>✨</span> Smart Auto-Fill
                </button>

                {globalSmartPasteMode && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid #333' }}>
                            <h3 style={{ marginTop: 0, color: 'white' }}>Smart Auto-Fill</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Paste the full product page text here. We'll extract the name, price, specs, and features automatically.</p>

                            <textarea
                                value={globalRawText}
                                onChange={(e) => setGlobalRawText(e.target.value)}
                                rows={15}
                                placeholder={"Paste raw text here...\n\nExample:\nTecno T302\nKSh2,500 KSh1,700\nKey Features:\n..."}
                                style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '0.85rem' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setGlobalSmartPasteMode(false)}
                                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGlobalSmartParse}
                                    style={{ padding: '8px 16px', background: '#ff6b00', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Process Text
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '1rem', color: isFeatured ? 'var(--accent)' : '#888', fontWeight: '600' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => {
                                setIsFeatured(e.target.checked);
                                if (e.target.checked) setIsOnSpecialOffer(false);
                            }}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                        />
                        Featured Product
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Product Name</label>
                        <input name="name" required value={formData.name} placeholder="e.g. iPhone 15 Pro" style={inputStyle} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Brand</label>
                        <input name="brand" value={formData.brand} placeholder="e.g. Apple, Samsung" style={inputStyle} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Price (KES)</label>
                        <input name="price" type="number" required value={formData.price} placeholder="150000" style={inputStyle} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Stock Quantity</label>
                        <input name="stock" type="number" required value={formData.stock} placeholder="10" style={inputStyle} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Min Price (Optional - for range)</label>
                        <input name="minPrice" type="number" value={formData.minPrice} placeholder="15000" style={inputStyle} onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Max Price (Optional - for range)</label>
                        <input name="maxPrice" type="number" value={formData.maxPrice} placeholder="21000" style={inputStyle} onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })} />
                    </div>
                </div>

                <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#eee', fontWeight: '600' }}>
                        <input
                            type="checkbox"
                            checked={isOnSpecialOffer}
                            onChange={(e) => {
                                setIsOnSpecialOffer(e.target.checked);
                                if (e.target.checked) setIsFeatured(false);
                            }}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                        />
                        Put on Special Offer / Sale
                    </label>
                    {isOnSpecialOffer && (
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ ...labelStyle, marginTop: 0, fontSize: '0.85rem' }}>Sale Price (KES)</label>
                            <input
                                type="number"
                                value={salePrice}
                                placeholder="e.g. 145000"
                                style={inputStyle}
                                onChange={(e) => setSalePrice(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                    <label style={{ ...labelStyle, marginTop: 0 }}>Product Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                        style={{ ...inputStyle, borderColor: status === 'draft' ? '#ff4444' : '#00E676' }}
                    >
                        <option value="published">Published</option>
                        <option value="draft">Draft (Unpublished)</option>
                    </select>
                </div>

                <label style={labelStyle}>Category</label>
                <select
                    name="category"
                    value={formData.category}
                    style={inputStyle}
                    onChange={(e) => {
                        const newCategory = e.target.value;
                        setFormData({
                            ...formData,
                            category: newCategory,
                            subcategory: categorySubcategoryMap[newCategory]?.[0] || ''
                        });
                    }}
                >
                    {Object.keys(categorySubcategoryMap).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <label style={labelStyle}>Subcategory (Optional)</label>
                <select
                    name="subcategory"
                    value={formData.subcategory}
                    style={inputStyle}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                >
                    <option value="">Select Subcategory</option>
                    {categorySubcategoryMap[formData.category]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>




                <div>
                    <label style={labelStyle}>Colors</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {colors.map(c => (
                            <span key={c} style={{ background: '#222', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {c}
                                <button type="button" onClick={() => removeColor(c)} style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>&times;</button>
                            </span>
                        ))}
                    </div>
                    <input
                        value={colorInput}
                        onChange={handleColorInputChange}
                        onKeyDown={handleColorAdd}
                        placeholder="Type color and press Enter, or separate by commas..."
                        style={inputStyle}
                    />
                </div>

                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} rows={6} style={inputStyle} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <label style={labelStyle}>YouTube Video URL (Optional)</label>
                <input name="youtubeVideoUrl" value={formData.youtubeVideoUrl} placeholder="https://www.youtube.com/watch?v=..." style={inputStyle} onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })} />

                {formData.youtubeVideoUrl && ((url) => {
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                    const match = url.match(regExp);
                    const videoId = (match && match[2].length === 11) ? match[2] : null;

                    if (!videoId) return null;

                    return (
                        <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333', background: '#000', maxWidth: '400px' }}>
                            <div style={{ padding: '8px', background: '#1a1a1a', borderBottom: '1px solid #333', fontSize: '0.75rem', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Preview</span>
                                <span style={{ color: '#00E676' }}>Valid YouTube ID: {videoId}</span>
                            </div>
                            <iframe
                                width="100%"
                                height="225"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    );
                })(formData.youtubeVideoUrl)}

                {/* Variants Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Product Variants</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: hasVariants ? 'var(--accent)' : '#888' }}>
                            <input
                                type="checkbox"
                                checked={hasVariants}
                                onChange={(e) => setHasVariants(e.target.checked)}
                                style={{ accentColor: 'var(--accent)' }}
                            />
                            Enable Variants
                        </label>
                    </div>

                    {hasVariants && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                            {/* Variant Type Checkboxes */}
                            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: variantTypes.storage ? 'var(--accent)' : '#888' }}>
                                    <input type="checkbox" checked={variantTypes.storage} onChange={(e) => setVariantTypes({ ...variantTypes, storage: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
                                    Storage
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: variantTypes.warranty ? 'var(--accent)' : '#888' }}>
                                    <input type="checkbox" checked={variantTypes.warranty} onChange={(e) => setVariantTypes({ ...variantTypes, warranty: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
                                    Warranty
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: variantTypes.sim ? 'var(--accent)' : '#888' }}>
                                    <input type="checkbox" checked={variantTypes.sim} onChange={(e) => setVariantTypes({ ...variantTypes, sim: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
                                    SIM Card Slots
                                </label>
                            </div>

                            {/* Storage Variants Table */}
                            {variantTypes.storage && (
                                <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem', display: 'block', fontWeight: 'bold' }}>Storage Variants</label>
                                    {storageVariants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                            <input placeholder="Name (e.g. 128GB)" value={v.name} onChange={(e) => {
                                                const newV = [...storageVariants]; newV[i].name = e.target.value; setStorageVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Price" value={v.price} onChange={(e) => {
                                                const newV = [...storageVariants]; newV[i].price = e.target.value; setStorageVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Sale Price" value={v.salePrice} onChange={(e) => {
                                                const newV = [...storageVariants]; newV[i].salePrice = e.target.value; setStorageVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => {
                                                const newV = [...storageVariants]; newV[i].stock = e.target.value; setStorageVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <input type="checkbox" checked={v.isDisabled} onChange={(e) => {
                                                    const newV = [...storageVariants]; newV[i].isDisabled = e.target.checked; setStorageVariants(newV);
                                                }} /> Disabled
                                            </label>
                                            <button type="button" onClick={() => setStorageVariants(storageVariants.filter((_, idx) => idx !== i))} style={{ background: '#333', color: '#ff4444', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px' }}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setStorageVariants([...storageVariants, { name: '', price: '', salePrice: '', stock: '', isDisabled: false }])} style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Storage Variant</button>
                                </div>
                            )}

                            {/* Warranty Variants Table */}
                            {variantTypes.warranty && (
                                <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem', display: 'block', fontWeight: 'bold' }}>Warranty Variants</label>
                                    {warrantyVariants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                            <input placeholder="Name (e.g. 1 Year)" value={v.name} onChange={(e) => {
                                                const newV = [...warrantyVariants]; newV[i].name = e.target.value; setWarrantyVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => {
                                                const newV = [...warrantyVariants]; newV[i].stock = e.target.value; setWarrantyVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <input type="checkbox" checked={v.isDisabled} onChange={(e) => {
                                                    const newV = [...warrantyVariants]; newV[i].isDisabled = e.target.checked; setWarrantyVariants(newV);
                                                }} /> Disabled
                                            </label>
                                            <button type="button" onClick={() => setWarrantyVariants(warrantyVariants.filter((_, idx) => idx !== i))} style={{ background: '#333', color: '#ff4444', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px' }}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setWarrantyVariants([...warrantyVariants, { name: '', stock: '', isDisabled: false }])} style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Warranty Variant</button>
                                </div>
                            )}

                            {/* SIM Variants Table */}
                            {variantTypes.sim && (
                                <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem', display: 'block', fontWeight: 'bold' }}>SIM Card Slot Variants</label>
                                    {simVariants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                            <input placeholder="Name (e.g. Dual SIM)" value={v.name} onChange={(e) => {
                                                const newV = [...simVariants]; newV[i].name = e.target.value; setSimVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => {
                                                const newV = [...simVariants]; newV[i].stock = e.target.value; setSimVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <input type="checkbox" checked={v.isDisabled} onChange={(e) => {
                                                    const newV = [...simVariants]; newV[i].isDisabled = e.target.checked; setSimVariants(newV);
                                                }} /> Disabled
                                            </label>
                                            <button type="button" onClick={() => setSimVariants(simVariants.filter((_, idx) => idx !== i))} style={{ background: '#333', color: '#ff4444', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px' }}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setSimVariants([...simVariants, { name: '', stock: '', isDisabled: false }])} style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add SIM Variant</button>
                                </div>
                            )}

                            {/* Legacy Variants */}
                            {!variantTypes.storage && !variantTypes.warranty && !variantTypes.sim && variants.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {variants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                                            <input placeholder="Name (e.g. 256GB)" value={v.name} onChange={(e) => {
                                                const newV = [...variants]; newV[i].name = e.target.value; setVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Price" value={v.price} onChange={(e) => {
                                                const newV = [...variants]; newV[i].price = e.target.value; setVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => {
                                                const newV = [...variants]; newV[i].stock = e.target.value; setVariants(newV);
                                            }} style={{ ...inputStyle, marginTop: 0 }} />
                                            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} style={{ background: '#333', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer' }}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setVariants([...variants, { name: '', price: '', stock: '' }])} style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer' }}>+ Add Legacy Variant</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0, fontSize: '1.1rem', color: 'white', fontWeight: 'bold' }}>Key Features</label>
                        <button
                            type="button"
                            onClick={() => setSmartPasteMode(prev => ({ ...prev, features: !prev.features }))}
                            style={{ fontSize: '0.85rem', color: '#ffb700', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            ✨ Smart Paste
                        </button>
                    </div>

                    {features.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="Feature (e.g. Camera)"
                                value={item.key}
                                onChange={(e) => handleFeatureChange(i, 'key', e.target.value)}
                                style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                            />
                            <input
                                placeholder="Value (e.g. 48MP)"
                                value={item.value}
                                onChange={(e) => handleFeatureChange(i, 'value', e.target.value)}
                                style={{ ...inputStyle, marginTop: 0, flex: 2 }}
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(i)}
                                title="Remove Row"
                                style={{
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    border: '1px solid rgba(255, 68, 68, 0.3)',
                                    color: '#ff4444',
                                    borderRadius: '6px',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                &times;
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const newFeatures = [...features];
                                    newFeatures.splice(i + 1, 0, { key: '', value: '' });
                                    setFeatures(newFeatures);
                                }}
                                title="Insert Row Below"
                                style={{
                                    background: 'rgba(0, 200, 83, 0.1)',
                                    border: '1px solid rgba(0, 200, 83, 0.3)',
                                    color: '#00E676',
                                    borderRadius: '6px',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                +
                            </button>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                        <button type="button" onClick={addFeature} style={{ fontSize: '0.9rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '600' }}>+ Insert</button>
                    </div>

                    {smartPasteMode.features && (
                        <div style={{ marginTop: '0.5rem', padding: '10px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Paste text below to auto-fill rows (Format: "Key: Value")</p>
                            <textarea
                                autoFocus
                                placeholder="Example:\nBattery: 5000mAh\nScreen: 6.8 inch AMOLED"
                                onPaste={(e) => {
                                    handleSmartPaste(e, 'features');
                                    // Optional: close after paste
                                    // setSmartPasteMode(prev => ({...prev, features: false}));
                                }}
                                style={{ ...inputStyle, height: '100px', fontSize: '0.85rem', marginTop: 0 }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0, fontSize: '1.1rem', color: 'white', fontWeight: 'bold' }}>Technical Specifications</label>
                        <button
                            type="button"
                            onClick={() => setSmartPasteMode(prev => ({ ...prev, specs: !prev.specs }))}
                            style={{ fontSize: '0.85rem', color: '#ffb700', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            ✨ Smart Paste
                        </button>
                    </div>

                    {specifications.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="Spec (e.g. Processor)"
                                value={item.key}
                                onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                                style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                            />
                            <input
                                placeholder="Value (e.g. A16 Bionic)"
                                value={item.value}
                                onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                                style={{ ...inputStyle, marginTop: 0, flex: 2 }}
                            />
                            <button
                                type="button"
                                onClick={() => removeSpec(i)}
                                title="Remove Row"
                                style={{
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    border: '1px solid rgba(255, 68, 68, 0.3)',
                                    color: '#ff4444',
                                    borderRadius: '6px',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                &times;
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const newSpecs = [...specifications];
                                    newSpecs.splice(i + 1, 0, { key: '', value: '' });
                                    setSpecifications(newSpecs);
                                }}
                                title="Insert Row Below"
                                style={{
                                    background: 'rgba(0, 200, 83, 0.1)',
                                    border: '1px solid rgba(0, 200, 83, 0.3)',
                                    color: '#00E676',
                                    borderRadius: '6px',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                +
                            </button>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                        <button type="button" onClick={addSpec} style={{ fontSize: '0.9rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '600' }}>+ Add Specification</button>
                    </div>

                    {smartPasteMode.specs && (
                        <div style={{ marginTop: '0.5rem', padding: '10px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Paste text below to auto-fill rows (Format: "Key: Value")</p>
                            <textarea
                                autoFocus
                                placeholder="Example:\nProcessor: Snapdragon 8 Gen 3\nRAM: 16GB"
                                onPaste={(e) => {
                                    handleSmartPaste(e, 'specs');
                                }}
                                style={{ ...inputStyle, height: '100px', fontSize: '0.85rem', marginTop: 0 }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', color: 'white' }}>Product Images</label>
                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                            The first image will be used as the main product thumbnail.
                        </p>
                        <MultiImageUploader
                            value={galleryImages}
                            onChange={(urls) => {
                                setGalleryImages(urls);
                                setFormData(prev => ({ ...prev, image: urls[0] || '' }));
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #333', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '12px 24px', background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 12px hsla(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.3)' }}
                    >
                        {loading ? 'Update...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
