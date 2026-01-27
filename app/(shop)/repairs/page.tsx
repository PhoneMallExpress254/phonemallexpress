"use client";

import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Smartphone, Monitor, ShieldCheck, PenTool, Wrench, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RepairsPage() {
    const services = [
        {
            icon: <Smartphone size={32} />,
            title: "Screen Replacement",
            desc: "Cracked screen? We replace screens for iPhone, Samsung, and other major brands using high-quality parts."
        },
        {
            icon: <Wrench size={32} />,
            title: "Battery Replacement",
            desc: "Extend your phone's life with a fresh battery. Fast service for declining battery health."
        },
        {
            icon: <Monitor size={32} />,
            title: "Hardware Repairs",
            desc: "Speaker issues, charging port problems, or camera malfunctions? We fix internal hardware faults."
        },
        {
            icon: <PenTool size={32} />,
            title: "Software Issues",
            desc: "Boot loops, software crashes, or data recovery. We handle software troubleshooting and updates."
        },
        {
            icon: <Clock size={32} />,
            title: "Fast Turnaround",
            desc: "Most common repairs are completed within 1-2 hours while you wait."
        },
        {
            icon: <ShieldCheck size={32} />,
            title: "Warranty on Repairs",
            desc: "All our repairs come with a warranty for your peace of mind and satisfaction."
        }
    ];

    return (
        <div className="container">
            <Breadcrumbs items={[{ label: 'Repairs & Services', href: '/repairs' }]} />

            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
                    Professional Device Repairs
                </h1>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto', fontSize: 'var(--font-size-lg)' }}>
                    Trust our expert technicians to bring your device back to life. We specialize in quick, reliable repairs for smartphones, tablets, and laptops.
                </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                {services.map((s, i) => (
                    <div key={i} style={{
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <div style={{ color: 'var(--accent)' }}>{s.icon}</div>
                        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{s.title}</h3>
                        <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                textAlign: 'center',
                marginBottom: 'var(--spacing-sm)',
            }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>Need a Repair Quote?</h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--spacing-lg)', maxWidth: '500px', margin: '0 auto var(--spacing-lg)' }}>
                    Contact us on WhatsApp for a quick estimate or visit our shop for a diagnosis.
                </p>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                        href="https://wa.me/254718948929?text=Hi%2C%20I%20have%20a%20device%20repair%20inquiry."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}
                    >
                        Get a Quote on WhatsApp
                    </a>
                    <Link href="/contact" className="btn btn-outline" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                        Visit Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
