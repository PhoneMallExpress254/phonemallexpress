"use client";

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = "254718948929";
    const message = "Hi, I'm interested in your products.";

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={32} />
        </a>
    );
}
