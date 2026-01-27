"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Building2 } from 'lucide-react';

const RSQPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the popup recently
        const dismissedAt = localStorage.getItem('rsq_popup_dismissed');
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!dismissedAt || (now - parseInt(dismissedAt) > oneDay)) {
            const timer = setTimeout(() => {
                setShouldRender(true);
                // Small delay for fade-in
                setTimeout(() => setIsVisible(true), 50);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 300); // Remove from DOM after fade-out
        localStorage.setItem('rsq_popup_dismissed', new Date().getTime().toString());
    };

    if (!shouldRender) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: isVisible ? 'rgba(0,0,0,0.5)' : 'transparent',
            pointerEvents: isVisible ? 'auto' : 'none',
            transition: 'background-color 0.3s ease',
            backdropFilter: isVisible ? 'blur(4px)' : 'none'
        }}>
            <div style={{
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '450px',
                padding: '24px',
                position: 'relative',
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Building2 size={28} />
                    </div>

                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '8px'
                    }}>
                        Buying for Business?
                    </h3>

                    <p style={{
                        color: 'var(--muted-foreground)',
                        marginBottom: '20px',
                        lineHeight: 1.5
                    }}>
                        Get exclusive bulk pricing and priority support for your organization. Request a custom quote today!
                    </p>

                    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                        <Link
                            href="/bulk-quote"
                            onClick={handleClose}
                            style={{
                                display: 'inline-block',
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--foreground)',
                                color: 'var(--background)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                textDecoration: 'none',
                                textAlign: 'center'
                            }}
                        >
                            Get Bulk Quote
                        </Link>
                        <button
                            onClick={handleClose}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'transparent',
                                color: 'var(--muted-foreground)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            No thanks, maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RSQPopup;
