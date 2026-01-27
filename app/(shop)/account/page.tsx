"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import { User, Gift, Clock, Truck, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
    const benefits = [
        {
            icon: <Clock size={24} />,
            title: "Order History",
            desc: "Track your current orders and view past purchases easily."
        },
        {
            icon: <Truck size={24} />,
            title: "Faster Checkout",
            desc: "Save your shipping details for a seamless checkout experience."
        },
        {
            icon: <Gift size={24} />,
            title: "Exclusive Offers",
            desc: "Get access to member-only discounts and early product launches."
        },
        {
            icon: <ShieldCheck size={24} />,
            title: "Warranty Management",
            desc: "Register your products and manage warranty claims in one place."
        }
    ];

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-lg)' }}>
            <Breadcrumbs items={[{ label: 'My Account', href: '/account' }]} />

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
                padding: 'var(--spacing-md) 0'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--secondary)',
                    color: 'var(--accent)',
                    marginBottom: 'var(--spacing-sm)'
                }}>
                    <User size={40} />
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: 800,
                    marginBottom: 'var(--spacing-sm)'
                }}>
                    Account Dashboard Coming Soon
                </h1>

                <p style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--muted-foreground)',
                    marginBottom: 'var(--spacing-lg)',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    We're building a personalized experience just for you. Soon you'll be able to create an account to manage everything in one place.
                </p>

                <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    textAlign: 'left'
                }}>
                    {benefits.map((b, i) => (
                        <div key={i} style={{
                            background: 'var(--secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)'
                        }}>
                            <div style={{ color: 'var(--accent)', marginBottom: 'var(--spacing-sm)' }}>
                                {b.icon}
                            </div>
                            <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{b.title}</h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>{b.desc}</p>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'var(--input)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                        In the meantime...
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--spacing-md)' }}>
                        You can still shop normally! All orders are tracked via your email address.
                    </p>
                    <Link href="/accessories" className="btn btn-primary">
                        Start Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
