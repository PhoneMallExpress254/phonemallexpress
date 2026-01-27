'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MultiImageUploader from '@/components/admin/MultiImageUploader';

interface FeatureObj {
    key: string;
    value: string;
}


const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
    'Phones': ['Smartphones', 'Feature Phones', 'Refurbished'],
    'Tablets': ['Apple iPad', 'Samsung Tablets', 'Tecno Tablets', 'Redmi Tablets', 'Xiaomi Tablets'],
    'Audio': ['Buds', 'Earphones', 'Headphones', 'Soundbar', 'Speakers'],
    'Gaming': ['Gaming Consoles', 'PlayStation Games', 'Gaming Controller', 'Gaming Headsets'],
    'Wearables': ['Smartwatch', 'Smart Bands', 'Smart Ring'],
    'Accessories': ['Samsung Accessories', 'Apple Accessories', 'Chargers & Adapters', 'Powerbanks', 'Cables', 'Screen Protectors', 'Phone Covers', 'Media Streamers', 'Handheld Gimbals', 'Modems', 'Mouse'],
    'Storage': ['Flash Drives', 'Hard Disks', 'Memory Cards', 'SSDs'],
    'Refrigerators': ['Side by side', 'Single door', 'Double door'],
    'Washing Machines': ['Top load', 'Front load'],
    'Kitchen ware': ['Cookers', 'Airfryers', 'Blenders', 'Electric kettles'],
    'TVs': ['Smart TVs', 'Android TVs', '4K UHD TVs', 'Tv Accessories'],
    'Cameras': ['Digital Cameras', 'Security Cameras', 'Camera Accessories'],
    'Other': ['General']
};

const PHONE_VARIANTS = [
    "4/64GB", "4/128GB",
    "6/128GB",
    "8/128GB", "8/256GB",
    "12/256GB", "12/512GB",
    "16/512GB", "16/1TB", "16/2TB"
];

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

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        salePrice: '',
        minPrice: '',
        maxPrice: '',
        category: 'Phones',
        subcategory: '',
        description: '',
        stock: '',
        image: '',
        images: [] as string[],
        youtubeVideoUrl: ''
    });

    // Features State
    const [features, setFeatures] = useState<FeatureObj[]>([
        { key: '', value: '' } // Start with one empty row
    ]);

    // Specifications State (New)
    const [specifications, setSpecifications] = useState<FeatureObj[]>([
        { key: '', value: '' }
    ]);

    // Advanced Fields State
    const [isFeatured, setIsFeatured] = useState(false);
    const [isOnSpecialOffer, setIsOnSpecialOffer] = useState(false);
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');
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

    // Auto-Save Logic
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timer = setTimeout(() => {
            saveDraft();
        }, 5000); // 5 seconds debounce

        return () => clearTimeout(timer);
    }, [formData, features, specifications, isFeatured, isOnSpecialOffer, colors, variants, storageVariants, warrantyVariants, simVariants, variantTypes]);

    const saveDraft = async () => {
        // Don't save if empty name
        if (!formData.name) return;

        setSavingDraft(true);
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
                ...formData,
                brand: formData.brand.trim() || null,
                subcategory: formData.subcategory.trim() || null,
                imageUrl: formData.images[0] || formData.image,
                images: formData.images,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                isOnSpecialOffer,
                colors,
                variants: hasVariants ? variants.map(v => ({
                    name: v.name,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })) : [],
                storageVariants: hasVariants && variantTypes.storage ? storageVariants.map(v => ({
                    ...v,
                    price: Number(v.price) || 0,
                    salePrice: Number(v.salePrice) || null,
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
                status: 'draft',
                price: Number(formData.price) || 0,
                salePrice: Number(formData.salePrice) || null,
                minPrice: Number(formData.minPrice) || 0,
                maxPrice: Number(formData.maxPrice) || 0
            };

            let res;
            if (draftId) {
                res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, _id: draftId }),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();
            if (data.success) {
                setDraftId(data.data._id);
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            setSavingDraft(false);
        }
    };



    // Features Smart Paste
    const [pasteModeFeatures, setPasteModeFeatures] = useState(false);
    const [rawTextFeatures, setRawTextFeatures] = useState('');

    const handleParseFeatures = () => {
        const rows = parseKeyFeatures(rawTextFeatures);
        if (rows.length > 0) {
            setFeatures(rows);
            setPasteModeFeatures(false);
            setRawTextFeatures('');
        }
    };

    // Specs Smart Paste
    const [pasteModeSpecs, setPasteModeSpecs] = useState(false);
    const [rawTextSpecs, setRawTextSpecs] = useState('');

    const handleParseSpecs = () => {
        const rows = parseTechnicalSpecs(rawTextSpecs);
        if (rows.length > 0) {
            setSpecifications(rows);
            setPasteModeSpecs(false);
            setRawTextSpecs('');
        }
    };

    // ------------------------------------------------------------------
    // GLOBAL SMART PARSER
    // ------------------------------------------------------------------
    const [globalSmartPasteMode, setGlobalSmartPasteMode] = useState(false);
    const [globalRawText, setGlobalRawText] = useState('');

    const handleGlobalSmartParse = () => {
        const text = globalRawText;
        if (!text.trim()) return;

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;

        // NOISE FILTERING
        // We filter out lines that are clearly navigational, warranty info, or site-specific metadata
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
            salePrice: salePriceVal || prev.salePrice,
            description: description || prev.description
        }));

        if (salePriceVal) setFormData(prev => ({ ...prev, salePrice: salePriceVal }));
        if (isSpecial) setIsOnSpecialOffer(true);
        if (featuresRows.length > 0) setFeatures(featuresRows);
        if (specsRows.length > 0) setSpecifications(specsRows);

        // Close modal
        setGlobalSmartPasteMode(false);
        setGlobalRawText('');
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Generic list handler
    const handleListChange = (
        list: FeatureObj[],
        setList: (l: FeatureObj[]) => void,
        index: number,
        field: 'key' | 'value',
        value: string
    ) => {
        const newList = [...list];
        newList[index][field] = value;
        setList(newList);
    };

    const addListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void) => {
        setList([...list, { key: '', value: '' }]);
    };

    const insertListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void, index: number) => {
        const newList = [...list];
        newList.splice(index + 1, 0, { key: '', value: '' });
        setList(newList);
    };

    const removeListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void, index: number) => {
        setList(list.filter((_, i) => i !== index));
    };

    // Color Helpers
    const handleAddColor = (e: React.KeyboardEvent) => {
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
                    // Filter duplicates again against the latest state if needed, but 'colors' closure is usually fine
                    // Ideally:
                    const uniqueNew = newColorsToAdd.filter(c => !prev.includes(c));
                    return [...prev, ...uniqueNew];
                });
            }
            setColorInput(lastChunk);
        } else {
            setColorInput(val);
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove));
    };

    // Variant Helpers
    const handleAddVariant = () => {
        setVariants([...variants, { name: '', price: '', stock: '' }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: 'name' | 'price' | 'stock', value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

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

            // Calculate Discount
            let discountPercentage = 0;
            const regularPrice = Number(formData.price) || 0;
            const salePriceVal = Number(formData.salePrice) || 0;

            if (isOnSpecialOffer && regularPrice > 0 && salePriceVal > 0 && salePriceVal < regularPrice) {
                discountPercentage = Math.round(((regularPrice - salePriceVal) / regularPrice) * 100);
            }

            const payload = {
                ...formData,
                brand: formData.brand.trim() || null,
                subcategory: formData.subcategory.trim() || null,
                imageUrl: formData.images[0] || formData.image,
                images: formData.images,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                isOnSpecialOffer,
                colors,
                discountPercentage,
                variants: hasVariants ? variants.map(v => ({
                    name: v.name,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })) : [],
                storageVariants: hasVariants && variantTypes.storage ? storageVariants.map(v => ({
                    ...v,
                    price: Number(v.price) || 0,
                    salePrice: Number(v.salePrice) || null,
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
                status: 'published',
                price: regularPrice,
                salePrice: salePriceVal || null,
                minPrice: Number(formData.minPrice) || 0,
                maxPrice: Number(formData.maxPrice) || 0
            };

            let res;
            if (draftId) {
                res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, _id: draftId }),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Failed to publish product');
            }
        } catch (error) {
            console.error(error);
            alert('Error publishing product');
        } finally {
            setLoading(false);
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

    const renderKeyValueSection = (
        title: string,
        list: FeatureObj[],
        setList: (l: FeatureObj[]) => void,
        pasteMode: boolean,
        setPasteMode: (b: boolean) => void,
        rawText: string,
        setRawText: (s: string) => void,
        handleParse: () => void,
        placeholder: string,
        parser: (text: string) => FeatureObj[]
    ) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
            // Split row on Ctrl+Enter or Ctrl+N if needed
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                insertListRow(list, setList, index);
            }
        };

        return (
            <div style={{ marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ ...labelStyle, marginTop: 0, marginBottom: 0, color: '#ff6b00', fontWeight: 'bold' }}>{title}</label>
                    <button
                        type="button"
                        onClick={() => setPasteMode(!pasteMode)}
                        style={{ fontSize: '0.85rem', color: '#ff6b00', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {pasteMode ? 'Back to Manual' : '✨ Smart Paste'}
                    </button>
                </div>

                {pasteMode ? (
                    <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #333' }}>
                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                            Paste specs block here. Format: <b>"Key: Value"</b>
                        </p>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            rows={8}
                            placeholder={placeholder}
                            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleParse}
                                style={{ padding: '8px 16px', background: '#ccc', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Auto-Fill
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {list.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        placeholder="Key"
                                        value={item.key}
                                        onChange={(e) => handleListChange(list, setList, index, 'key', e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                                    />
                                    <textarea
                                        placeholder="Value"
                                        value={item.value}
                                        onChange={(e) => handleListChange(list, setList, index, 'value', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 2, minHeight: '38px', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeListRow(list, setList, index)}
                                        style={{ background: '#333', border: 'none', color: '#ff4444', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => addListRow(list, setList)}
                            style={{ marginTop: '1rem', background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            + Add Row
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-display)' }}>Add New Product</h1>

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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: isFeatured ? 'var(--accent)' : '#888' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => {
                                setIsFeatured(e.target.checked);
                                if (e.target.checked) setIsOnSpecialOffer(false);
                            }}
                            style={{ accentColor: 'var(--accent)' }}
                        />
                        Featured Product
                    </label>
                    <div style={{ fontSize: '0.85rem', color: '#888', borderLeft: '1px solid #333', paddingLeft: '1rem' }}>
                        {savingDraft ? (
                            <span style={{ color: 'var(--accent)' }}>Saving Draft...</span>
                        ) : lastSaved ? (
                            <span>Saved {lastSaved.toLocaleTimeString()}</span>
                        ) : (
                            <span>Unsaved</span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '12px', border: '1px solid #222' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Product Name</label>
                        <input name="name" required value={formData.name} placeholder="e.g. iPhone 15 Pro" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={labelStyle}>Brand</label>
                        <input name="brand" value={formData.brand} placeholder="e.g. Apple" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Price (KES)</label>
                        <input name="price" type="number" required value={formData.price} placeholder="150000" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={labelStyle}>Stock Quantity</label>
                        <input name="stock" type="number" required value={formData.stock} placeholder="10" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                {/* Discounted Price Section */}
                {/* Discounted Price Section */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: isOnSpecialOffer ? '#ff4444' : '#888' }}>
                            <input
                                type="checkbox"
                                checked={isOnSpecialOffer}
                                onChange={(e) => {
                                    setIsOnSpecialOffer(e.target.checked);
                                    if (e.target.checked) setIsFeatured(false);
                                }}
                                style={{ accentColor: '#ff4444' }}
                            />
                            Flash Sale / Special Offer
                        </label>
                    </div>
                    {isOnSpecialOffer && (
                        <div style={{ flex: 1 }}>
                            <label style={{ ...labelStyle, marginTop: 0 }}>Discounted Price (Sale Price)</label>
                            <input name="salePrice" type="number" value={formData.salePrice} placeholder="Lower than original price" style={inputStyle} onChange={handleChange} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Min Price (Optional - for range)</label>
                        <input name="minPrice" type="number" value={formData.minPrice} placeholder="15000" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Max Price (Optional - for range)</label>
                        <input name="maxPrice" type="number" value={formData.maxPrice} placeholder="21000" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                <label style={labelStyle}>Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    {Object.keys(CATEGORY_SUBCATEGORIES).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <label style={labelStyle}>Subcategory</label>
                <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="">Select Subcategory</option>
                    {CATEGORY_SUBCATEGORIES[formData.category]?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>

                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} rows={4} style={inputStyle} onChange={handleChange} />

                <label style={labelStyle}>YouTube Video URL (Optional)</label>
                <input name="youtubeVideoUrl" value={formData.youtubeVideoUrl} placeholder="https://www.youtube.com/watch?v=..." style={inputStyle} onChange={handleChange} />

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

                {/* Colors Section */}
                <label style={labelStyle}>Colors</label>
                <div style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    {colors.map(c => (
                        <span key={c} style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {c}
                            <button type="button" onClick={() => handleRemoveColor(c)} style={{ border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </span>
                    ))}
                    <input
                        placeholder="Type color & Enter, or separate by commas..."
                        value={colorInput}
                        onChange={handleColorInputChange}
                        onKeyDown={handleAddColor}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', minWidth: '120px' }}
                    />
                </div>

                {/* Variants Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Product Variants</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: hasVariants ? 'var(--accent)' : '#888' }}>
                            <input
                                type="checkbox"
                                checked={hasVariants}
                                onChange={(e) => setHasVariants(e.target.checked)}
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

                            {/* Legacy Variants (Hidden if grouped used, or keep for transition) */}
                            {!variantTypes.storage && !variantTypes.warranty && !variantTypes.sim && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {variants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                                            <input placeholder="Name (e.g. 256GB)" value={v.name} onChange={(e) => handleVariantChange(i, 'name', e.target.value)} list={formData.category === 'Phones' ? "phone-variants" : undefined} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Price" value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} style={{ ...inputStyle, marginTop: 0 }} />
                                            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} style={{ ...inputStyle, marginTop: 0 }} />
                                            <button type="button" onClick={() => handleRemoveVariant(i)} style={{ background: '#333', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer' }}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddVariant} style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer' }}>+ Add Legacy Variant</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Key Features Section */}
                {renderKeyValueSection(
                    'Key Features',
                    features,
                    setFeatures,
                    pasteModeFeatures,
                    setPasteModeFeatures,
                    rawTextFeatures,
                    setRawTextFeatures,
                    handleParseFeatures,
                    'Resolution: 4K\nBattery: 5000mAh',
                    parseKeyFeatures
                )}

                {/* Specifications Section */}
                {renderKeyValueSection(
                    'Technical Specifications',
                    specifications,
                    setSpecifications,
                    pasteModeSpecs,
                    setPasteModeSpecs,
                    rawTextSpecs,
                    setRawTextSpecs,
                    handleParseSpecs,
                    'Display Type: AMOLED\nDimensions: 159.2 x 75 x 12.9 mm',
                    parseTechnicalSpecs
                )}

                <label style={labelStyle}>Product Images</label>

                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <MultiImageUploader
                        value={formData.images}
                        onChange={(urls) => setFormData({ ...formData, images: urls })}
                    />
                </div>

                <details style={{ marginTop: '1rem' }}>
                    <summary style={{ fontSize: '0.8rem', color: '#666', cursor: 'pointer' }}>Or use external URL (Main Image)</summary>
                    <input name="image" placeholder="https://..." value={formData.image} style={inputStyle} onChange={handleChange} />
                </details>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            await saveDraft();
                            alert('Draft saved successfully!');
                        }}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', color: 'var(--accent)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {savingDraft ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'Publishing...' : 'Publish Product'}
                    </button>
                </div>

                <datalist id="phone-variants">
                    {PHONE_VARIANTS.map(variant => (
                        <option key={variant} value={variant} />
                    ))}
                </datalist>

            </form>
        </div >
    );
}
