"use client";

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import './Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'homepage' }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                setMessage(data.message || 'Subscribed successfully!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <section className="newsletter-section">
            <div className="container">
                <div className="newsletter-card">
                    <div className="newsletter-icon">
                        <Mail size={26} />
                    </div>
                    <div className="newsletter-copy">
                        <h2>Stay in the Loop</h2>
                        <p>Get exclusive deals, new arrivals, and tech tips straight to your inbox.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="newsletter-success">
                            <CheckCircle2 size={20} />
                            <span>{message}</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="newsletter-form">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-input"
                                disabled={status === 'loading'}
                            />
                            <button type="submit" className="btn btn-primary newsletter-btn" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    )}
                    {status === 'error' && <p className="newsletter-error">{message}</p>}
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
