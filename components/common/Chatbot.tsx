"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! How can I help you find the perfect gadget today?' }
    ]);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const [limitWarningDismissed, setLimitWarningDismissed] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUICK_PROMPTS = [
        "Buying Guide",
        "Repair Services",
        "Shop Location",
        "Under 20k Phones",
        "Contact Support"
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 20000);
        return () => clearTimeout(timer);
    }, []);

    // Load messages from Local Storage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('chat_history');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history");
            }
        }

        // Show limit warning on mount/open
        setShowLimitWarning(true);
        const timer = setTimeout(() => {
            setShowLimitWarning(false);
        }, 12000); // Disappear after 12s

        return () => clearTimeout(timer);
    }, []);

    // Save messages to Local Storage whenever they change
    useEffect(() => {
        if (messages.length > 1) { // Don't save if it's just the initial greeting alone, or do? User might want to keep history.
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, showLimitWarning]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If rate limited, show a system-like message but dont verify user here
                if (response.status === 429) {
                    setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ You have reached your daily limit of 6 messages. Please contact us on WhatsApp for unlimited support." }]);
                } else {
                    throw new Error(data.error || 'Failed to connect');
                }
            } else if (data.choices && data.choices[0]) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
            }
        } catch (error: any) {
            console.error(error);
            // Use existing error message logic if needed, but the 429 above handles the limit nicely
            if (!messages.some(m => m.content.includes("daily limit"))) {
                setMessages(prev => [...prev, { role: 'assistant', content: error.message || "Sorry, I'm having trouble connecting right now." }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <>
            {/* Tooltip */}
            {showTooltip && !isOpen && (
                <div className="chatbot-tooltip">
                    Need help? Talk to us
                </div>
            )}

            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={() => {
                    setIsOpen(true);
                    setShowTooltip(false);
                }}
                aria-label="Open Chat"
            >
                <Bot size={24} />
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <div className="flex items-center gap-xs">
                        <Bot size={20} />
                        <span className="font-bold">Phone Mall Asst.</span>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="chatbot-messages">
                    {/* Rate Limit Warning */}
                    {showLimitWarning && !limitWarningDismissed && (
                        <div className="limit-warning" style={{
                            padding: '8px 12px',
                            background: '#fff3cd',
                            border: '1px solid #ffeeba',
                            color: '#856404',
                            fontSize: '0.85rem',
                            borderRadius: '6px',
                            margin: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                            <span>Free usage: You have up to 6 message requests per day.</span>
                            <button
                                onClick={() => {
                                    setShowLimitWarning(false);
                                    setLimitWarningDismissed(true);
                                }}
                                style={{ background: 'none', border: 'none', color: '#856404', cursor: 'pointer', padding: '0 4px', fontSize: '1.2rem' }}
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="chatbot-prompts">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            className="prompt-chip"
                            onClick={() => handleSend(prompt)}
                            disabled={isLoading}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="chatbot-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about phones, prices..."
                        className="chatbot-input"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
                        <Send size={16} />
                    </button>
                </form>
            </div >
        </>
    );
}
