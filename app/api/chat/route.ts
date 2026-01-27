import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
    if (!OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let messages;
    try {
        const body = await req.json();
        messages = body.messages;
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Rate Limiting Logic
    const cookieStore = await cookies();
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `chat_usage_${today}`;
    const currentUsage = parseInt(cookieStore.get(usageKey)?.value || '0');

    // Check if message is a greeting (to exclude from limit)
    const lastUserMessage = messages[messages.length - 1]?.content?.trim() || "";
    // Sanitize for regex - escape special chars
    const safeQuery = lastUserMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 50); // limit length

    const GREETINGS = ['hi', 'hello', 'hey', 'hi there', 'hello there', 'hallo', 'greetings', 'habari', 'sasa', 'good morning', 'good afternoon', 'good evening'];

    // Strict match or starts with (e.g. "Hi there") - but aim to catch short greetings mostly
    const isGreeting = GREETINGS.some(g => lastUserMessage.toLowerCase() === g || (lastUserMessage.toLowerCase().startsWith(g + '') && lastUserMessage.length < 15));

    if (!isGreeting && currentUsage >= 6) {
        return NextResponse.json({
            error: 'You have reached your daily limit of 6 messages. Please contasct us on WhatsApp for unlimited support.'
        }, { status: 429 });
    }

    try {
        await dbConnect();

        // Context Retrieval (RAG-lite)
        let productContext = "";

        // Only search if not a greeting and query is long enough
        if (!isGreeting && safeQuery.length > 2) {
            const products = await Product.find({
                status: 'published',
                $or: [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { brand: { $regex: safeQuery, $options: 'i' } },
                    { category: { $regex: safeQuery, $options: 'i' } },
                    { subcategory: { $regex: safeQuery, $options: 'i' } }
                ]
            })
                .select('name price stock brand category')
                .limit(5)
                .lean();

            if (products.length > 0) {
                const productList = products.map((p: any) =>
                    `- ${p.name} (${p.brand}): KES ${p.price.toLocaleString()} | Stock: ${p.stock}`
                ).join('\n');

                productContext = `
                CONTEXT FROM DATABASE:
                The following products match the user's query. Use this EXACT information to answer price/stock questions.
                ${productList}
                
                If the user asks for a specific product and it is NOT in the list above, assume we do not have it or it is out of stock.
                `;
            }
        }

        const systemMessage = {
            role: "system",
            content: `You are the AI Assistant for Phone Mall Express.
            
            ${productContext}
            
            STRICT RULES:
            1. SCOPE: You are authorized to discuss the following product categories found in our menu:
               - Smartphones & Tablets (iPhone, Samsung, Tecno, Infinix, Xiaomi, iPad, etc.)
               - Computing (Laptops, Desktops, Monitors, Printers)
               - TVs & Audio (Smart TVs, Soundbars, Home Theaters, Bluetooth Speakers)
               - Home Appliances (Refrigerators, Washing Machines)
               - Kitchen Ware (Cookers, Airfryers, Blenders, Kettles)
               - Cameras (Digital & Security)
               - Gaming (Consoles & Accessories)
               - Smart Wearables (Watches, Bands, Rings)
               - Mobile & TV Accessories (Cases, Chargers, TV Remotes, Brackets, etc.)
               - Repairs & Services
            
            2. OUT OF SCOPE: Do NOT discuss products we do not sell (e.g., Furniture, Clothing, Auto Parts, etc.). If asked, politely decline and list our focus areas.

            3. Keep answers concise (under 3 sentences where possible).
            4. Be friendly and helpful.
            5. PRICES: If you have context data, quote the exact KES price. If not, ask the user to check the website or contact support.
            
            Your goal is to help customers find the right tech gadget or appliance.`
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [systemMessage, ...messages],
                temperature: 0.5,
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from OpenAI');
        }

        // Return success response with updated cookie ONLY if not a greeting
        const res = NextResponse.json(data);

        if (!isGreeting) {
            res.cookies.set(usageKey, (currentUsage + 1).toString(), {
                maxAge: 86400, // 24 hours
                path: '/',
            });
        }

        return res;

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
